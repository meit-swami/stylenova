import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ProductInfo {
  productName: string;
  description: string;
  images: string[];
  price: string;
  category: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    
    if (!url) {
      return new Response(
        JSON.stringify({ error: "Product URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Fetching product from URL:", url);

    // Detect platform for specialized extraction
    const isMyntra = url.includes('myntra.com');
    const isAjio = url.includes('ajio.com');
    const isNykaa = url.includes('nykaa.com') || url.includes('nykaafashion.com');
    const isFlipkart = url.includes('flipkart.com');
    const isAmazon = url.includes('amazon.in') || url.includes('amazon.com');

    // For sites with heavy JS/bot protection, try API-based approach first
    if (isMyntra) {
      const productId = url.match(/\/(\d+)\/buy/)?.[1] || url.match(/\/(\d+)\/?$/)?.[1];
      if (productId) {
        console.log("Detected Myntra product ID:", productId);
        try {
          // Try Myntra's internal API
          const apiResponse = await fetch(
            `https://www.myntra.com/gateway/v2/product/${productId}`,
            {
              headers: {
                "User-Agent": "Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
                "Accept": "application/json",
                "Accept-Language": "en-IN,en;q=0.9",
                "Referer": "https://www.myntra.com/",
                "Origin": "https://www.myntra.com",
              },
            }
          );
          
          if (apiResponse.ok) {
            const data = await apiResponse.json();
            const style = data?.style;
            if (style) {
              const images = style.media?.albums?.default?.images?.map((img: any) => 
                img.imageURL?.replace('($width)', '1080').replace('($height)', '1440')
              ) || [];
              
              console.log("Myntra API success:", { name: style.name, imageCount: images.length });
              
              return new Response(
                JSON.stringify({
                  productName: style.name || style.productDisplayName || "Myntra Product",
                  description: style.description || "",
                  images: images.slice(0, 10),
                  price: style.price?.discounted ? `₹${style.price.discounted}` : "",
                  category: detectCategory(style.articleType?.typeName || style.name || ""),
                }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
              );
            }
          }
        } catch (apiError) {
          console.log("Myntra API failed, falling back to HTML scraping:", apiError);
        }
      }
    }

    // Fetch the product page HTML with enhanced headers
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-IN,en-GB;q=0.9,en-US;q=0.8,en;q=0.7,hi;q=0.6",
        "Accept-Encoding": "gzip, deflate, br",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
        "Sec-Ch-Ua": '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        "Sec-Ch-Ua-Mobile": "?1",
        "Sec-Ch-Ua-Platform": '"Android"',
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status}`);
    }

    const html = await response.text();
    
    // Check if we got a blocked/maintenance page
    if (html.includes('Site Maintenance') || html.includes('Access Denied') || html.length < 5000) {
      console.log("Detected blocked page, trying alternative extraction...");
      
      // Return helpful error for manual image upload
      return new Response(
        JSON.stringify({
          error: "blocked",
          message: "This site blocks automated access. Please upload product images manually.",
          productName: "Product from " + new URL(url).hostname,
          description: "",
          images: [],
          price: "",
          category: "unknown",
          requiresManualUpload: true,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract product images using various patterns
    const images: string[] = [];
    
    // Pattern 1: Open Graph images
    const ogImageMatches = html.matchAll(/property=["']og:image["']\s*content=["']([^"']+)["']/gi);
    for (const match of ogImageMatches) {
      if (match[1] && !images.includes(match[1])) {
        images.push(match[1]);
      }
    }

    // Pattern 2: Twitter card images
    const twitterImageMatches = html.matchAll(/name=["']twitter:image["']\s*content=["']([^"']+)["']/gi);
    for (const match of twitterImageMatches) {
      if (match[1] && !images.includes(match[1])) {
        images.push(match[1]);
      }
    }

    // Pattern 3: Product schema images
    const schemaMatches = html.matchAll(/"image"\s*:\s*\[?["']([^"'\]]+)["']/gi);
    for (const match of schemaMatches) {
      if (match[1] && match[1].startsWith('http') && !images.includes(match[1])) {
        images.push(match[1]);
      }
    }

    // Pattern 4: High-res product images (common e-commerce patterns)
    const imgMatches = html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi);
    for (const match of imgMatches) {
      const src = match[1];
      if (src && src.startsWith('http') && !images.includes(src)) {
        // Filter for likely product images
        if (
          src.includes('product') ||
          src.includes('main') ||
          src.includes('large') ||
          src.includes('zoom') ||
          src.includes('/p/') ||
          src.match(/\d{3,}x\d{3,}/)
        ) {
          images.push(src);
        }
      }
    }

    // Pattern 5: Data-src attributes (lazy loaded images)
    const dataSrcMatches = html.matchAll(/data-src=["']([^"']+)["']/gi);
    for (const match of dataSrcMatches) {
      const src = match[1];
      if (src && src.startsWith('http') && !images.includes(src)) {
        images.push(src);
      }
    }

    // Extract product name
    let productName = "";
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    if (titleMatch) {
      productName = titleMatch[1].split('|')[0].split('-')[0].trim();
    }
    const ogTitleMatch = html.match(/property=["']og:title["']\s*content=["']([^"']+)["']/i);
    if (ogTitleMatch) {
      productName = ogTitleMatch[1];
    }

    // Extract description
    let description = "";
    const metaDescMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
    if (metaDescMatch) {
      description = metaDescMatch[1];
    }
    const ogDescMatch = html.match(/property=["']og:description["']\s*content=["']([^"']+)["']/i);
    if (ogDescMatch) {
      description = ogDescMatch[1];
    }

    // Extract price
    let price = "";
    const priceMatches = html.match(/₹\s*[\d,]+(?:\.\d{2})?|\$\s*[\d,]+(?:\.\d{2})?|Rs\.?\s*[\d,]+/gi);
    if (priceMatches && priceMatches.length > 0) {
      price = priceMatches[0];
    }

    // Detect category
    const category = detectCategory(productName + " " + description);

    const productInfo: ProductInfo = {
      productName: productName || "Fashion Product",
      description: description || "",
      images: images.slice(0, 10),
      price,
      category,
    };

    console.log("Extracted product info:", {
      name: productInfo.productName,
      imageCount: productInfo.images.length,
      category: productInfo.category,
    });

    return new Response(
      JSON.stringify(productInfo),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Fetch product error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        message: "Could not fetch product. Please upload images manually.",
        requiresManualUpload: true,
        productName: "Fashion Product",
        images: [],
        category: "unknown",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Helper function to detect category from text
function detectCategory(text: string): string {
  const lowerText = text.toLowerCase();
  if (
    lowerText.includes('saree') || 
    lowerText.includes('lehenga') || 
    lowerText.includes('kurti') || 
    lowerText.includes('kurta') ||
    lowerText.includes('dress') ||
    lowerText.includes('gown') ||
    lowerText.includes('suit') ||
    lowerText.includes('salwar') ||
    lowerText.includes('anarkali')
  ) {
    return "women_costume";
  } else if (
    lowerText.includes('necklace') || 
    lowerText.includes('earring') || 
    lowerText.includes('bangle') ||
    lowerText.includes('jewel') ||
    lowerText.includes('pendant') ||
    lowerText.includes('ring') ||
    lowerText.includes('bracelet')
  ) {
    return "jewellery";
  } else if (
    lowerText.includes('shirt') ||
    lowerText.includes('trouser') ||
    lowerText.includes('pant') ||
    lowerText.includes('jeans') ||
    lowerText.includes('blazer')
  ) {
    return "men_costume";
  }
  return "unknown";
}
