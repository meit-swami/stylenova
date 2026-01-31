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
    const { personImage, productImages, productName, productCategory } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!personImage || !productImages || productImages.length === 0) {
      return new Response(JSON.stringify({ error: "Person image and product images are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Generating try-on image for: ${productName}, category: ${productCategory}`);

    // Build the prompt for virtual try-on
    const prompt = buildTryOnPrompt(productName, productCategory);

    // Use Gemini image generation to create the try-on result
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt,
              },
              {
                type: "image_url",
                image_url: {
                  url: personImage,
                },
              },
              {
                type: "image_url",
                image_url: {
                  url: productImages[0],
                },
              },
            ],
          },
        ],
        modalities: ["image", "text"],
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
      throw new Error("AI image generation failed");
    }

    const data = await response.json();
    
    // Extract generated image from response
    const generatedImage = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    const textContent = data.choices?.[0]?.message?.content || "";

    if (!generatedImage) {
      console.log("No image generated, using fallback");
      // Return the person image as fallback if no image was generated
      return new Response(JSON.stringify({
        processedImageUrl: personImage,
        aiComment: textContent || "This outfit would look great on you!",
        success: false,
        fallback: true,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({
      processedImageUrl: generatedImage,
      aiComment: textContent,
      success: true,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Generate try-on image error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function buildTryOnPrompt(productName: string, productCategory: string): string {
  if (productCategory === 'jewellery') {
    return `Create a realistic virtual try-on image. 
Take the person from the first image and show them wearing the jewellery from the second image (${productName}).
The jewellery should look naturally placed on the person - if it's a necklace, place it around their neck; if earrings, on their ears.
Keep the person's face, body, and background intact. Only add the jewellery piece realistically.
Make it look like a professional fashion photo.`;
  }
  
  return `Create a realistic virtual try-on image.
Take the person from the first image and show them wearing the outfit/costume from the second image (${productName}).
The clothing should fit naturally on the person's body, maintaining their pose and proportions.
Keep the person's face and features intact. Replace or overlay their current outfit with the new one.
Ensure proper draping, fit, and realistic fabric appearance.
Make it look like a professional fashion photo.`;
}
