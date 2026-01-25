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

    if (type === "outfit_comment") {
      systemPrompt = `You are a friendly and enthusiastic fashion AI assistant at a store. Generate unique, natural comments about outfits customers are trying on. 
      
Language: ${language === "hindi" ? "Pure Hindi" : language === "english" ? "Pure English" : "Hinglish (mix of Hindi and English)"}

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
      systemPrompt = `You are an AI fashion consultant. Based on customer's features, suggest products from the store inventory that would look best on them.`;
      
      userPrompt = `Customer profile:
- Skin tone: ${context.skinTone}
- Body type: ${context.bodyType}
- Height: ${context.height}
- Favorite colors: ${context.favoriteColors?.join(", ")}

Available products: ${JSON.stringify(context.products?.slice(0, 20))}

Return top 5 product IDs that would suit this customer best, with match scores.`;
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

    return new Response(JSON.stringify({ content, type }), {
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
