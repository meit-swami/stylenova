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

    // Fetch the product page HTML
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status}`);
    }

    const html = await response.text();

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

    // Detect category from content
    let category = "unknown";
    const lowerHtml = html.toLowerCase();
    if (
      lowerHtml.includes('saree') || 
      lowerHtml.includes('lehenga') || 
      lowerHtml.includes('kurti') || 
      lowerHtml.includes('dress') ||
      lowerHtml.includes('gown') ||
      lowerHtml.includes('suit')
    ) {
      category = "women_costume";
    } else if (
      lowerHtml.includes('necklace') || 
      lowerHtml.includes('earring') || 
      lowerHtml.includes('bangle') ||
      lowerHtml.includes('jewel') ||
      lowerHtml.includes('pendant')
    ) {
      category = "jewellery";
    }

    const productInfo: ProductInfo = {
      productName: productName || "Fashion Product",
      description: description || "",
      images: images.slice(0, 10), // Return up to 10 images
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
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
