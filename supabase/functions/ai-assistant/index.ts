import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, context, language = "hinglish" } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    // Language instruction
    const langInstruction = language === "hindi" 
      ? "Respond in pure Hindi." 
      : language === "english" 
      ? "Respond in pure English." 
      : "Respond in Hinglish (mix of Hindi and English).";

    if (type === "outfit_comment") {
      systemPrompt = `You are a friendly and enthusiastic fashion AI assistant at a store. Generate unique, natural comments about outfits customers are trying on. 
      
${langInstruction}

Rules:
- Be genuine - if outfit doesn't look great, suggest alternatives politely
- Never repeat the same comment twice
- Keep responses short (1-2 sentences)
- Be warm and encouraging
- Use expressions like "Wow!", "Beautiful!", "Perfect!"`;

      userPrompt = `Customer is trying on: ${context.productName}
Detected skin tone: ${context.skinTone || "warm medium"}
Body type: ${context.bodyType || "average"}
Match score: ${context.matchScore || 85}%

Generate a unique, natural comment about how this outfit looks on them.`;

    } else if (type === "suggest_products") {
      systemPrompt = `You are an AI fashion consultant. Based on customer's features, suggest products from the store inventory that would look best on them. ${langInstruction}`;
      
      userPrompt = `Customer profile:
- Skin tone: ${context.skinTone}
- Body type: ${context.bodyType}
- Height: ${context.height}
- Favorite colors: ${context.favoriteColors?.join(", ")}

Available products: ${JSON.stringify(context.products?.slice(0, 20))}

Return top 5 product IDs that would suit this customer best, with match scores.`;

    } else if (type === "analyze_customer") {
      systemPrompt = `You are an expert fashion stylist and color analyst. Analyze the customer's photo to detect their physical features and provide personalized fashion recommendations.

${langInstruction}

Analyze and provide:
1. Skin tone (e.g., Fair, Medium, Olive, Warm, Cool undertones)
2. Complexion description
3. Body type estimation (e.g., Pear, Apple, Hourglass, Rectangle, Athletic)
4. Face shape (e.g., Oval, Round, Square, Heart, Oblong)
5. Recommended colors that would complement their features
6. Color preference suggestions (solid colors, patterns, etc.)
7. Style recommendations for traditional Indian wear

Be specific and personalized in your analysis.`;

      userPrompt = `Please analyze this customer's photo and provide detailed fashion recommendations.
The customer has shared their image for virtual try-on analysis.
Provide comprehensive analysis of their skin tone, body type, face shape, and recommend suitable colors and styles.`;

    } else if (type === "analyze_product") {
      systemPrompt = `You are a fashion product analyst. Analyze the product details and images to categorize and describe the item.

${langInstruction}

Determine:
1. Product name
2. Category: Is this a women's costume (saree, lehenga, kurti, dress, etc.) or jewellery (necklace, earrings, bangles, etc.) or other?
3. Product description
4. Colors present in the product
5. Material/fabric type
6. Suitability for virtual try-on

IMPORTANT: Only women's costumes and jewellery are valid for virtual try-on. Reject other product types.`;

      userPrompt = `Analyze this product:
URL: ${context.productUrl || 'Not provided'}
Description: ${context.productDescription || 'Not provided'}
Number of images: ${context.productImages?.length || 0}

Determine if this product is suitable for virtual try-on (women's costume or jewellery only).
Provide detailed product analysis.`;

    } else if (type === "ecom_tryon") {
      systemPrompt = `You are a virtual try-on AI assistant. Generate encouraging and personalized comments about how the product would look on the customer.

${langInstruction}

Consider:
- The customer's features from their photo
- The product being tried on
- Color compatibility
- Style matching

Be enthusiastic and helpful. Provide a match score percentage.`;

      userPrompt = `Customer is virtually trying on:
Product: ${context.productName}
Category: ${context.productCategory}
Product colors: ${context.productColors?.join(", ")}

Generate an encouraging comment about how this product would look on the customer.
Also suggest a match score percentage (70-99%).`;

    } else if (type === "voice_chat") {
      systemPrompt = `You are StyleNova's AI fashion stylist having a voice conversation with a customer. Be warm, friendly, and conversational. Keep responses concise (2-3 sentences) since this is spoken aloud.

${langInstruction}

You can help with:
- Outfit recommendations based on occasion, body type, or preferences
- Color matching and styling tips
- Fashion trends and seasonal suggestions
- Virtual try-on guidance
- General fashion questions

Be enthusiastic but genuine. If you don't know something, say so politely.`;

      userPrompt = context.message || "Hello! How can I help you with fashion today?";

    } else {
      // Default: general fashion assistant
      systemPrompt = `You are StyleNova's AI fashion assistant. Help customers with fashion advice, outfit suggestions, and style recommendations. ${langInstruction}`;
      userPrompt = context.message || "Hello! How can I help you with fashion today?";
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add more credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse match score from response if present
    let matchScore = 85;
    const scoreMatch = content.match(/(\d{2,3})%/);
    if (scoreMatch) {
      matchScore = Math.min(99, Math.max(70, parseInt(scoreMatch[1])));
    }

    return new Response(JSON.stringify({ 
      content, 
      type,
      matchScore,
      model: "google/gemini-3-flash-preview",
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("AI assistant error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
