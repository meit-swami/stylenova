import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SMSRequest {
  phone: string;
  message: string;
  customerName?: string;
  wishlistUrl?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, message, customerName, wishlistUrl }: SMSRequest = await req.json();

    if (!phone || !message) {
      return new Response(
        JSON.stringify({ error: "Phone and message are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Format phone number for India (add 91 prefix if not present)
    let formattedPhone = phone.replace(/\D/g, "");
    if (formattedPhone.length === 10) {
      formattedPhone = "91" + formattedPhone;
    }

    // Use Lovable AI to generate a personalized message
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    
    if (!lovableApiKey) {
      console.error("LOVABLE_API_KEY not configured");
      // Return success but log that SMS wasn't sent (for demo purposes)
      return new Response(
        JSON.stringify({ 
          success: true, 
          demo: true,
          message: "SMS notification simulated (API key not configured)",
          phone: formattedPhone,
          content: message
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate personalized SMS using Lovable AI
    const aiResponse = await fetch("https://api.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content: "You are an SMS message composer for a fashion store. Generate a short, friendly SMS message (max 160 characters) in Hinglish (mix of Hindi and English). Include the wishlist link provided. Be warm and engaging."
          },
          {
            role: "user",
            content: `Compose an SMS for customer "${customerName || 'valued customer'}" with their wishlist link: ${wishlistUrl || message}. Keep it under 160 characters.`
          }
        ],
        max_tokens: 100,
      }),
    });

    let smsContent = message;
    
    if (aiResponse.ok) {
      const aiData = await aiResponse.json();
      if (aiData.choices?.[0]?.message?.content) {
        smsContent = aiData.choices[0].message.content.trim();
      }
    }

    // Log the SMS that would be sent (for demo/development)
    console.log(`SMS to ${formattedPhone}: ${smsContent}`);

    // In production, you would integrate with an SMS provider like:
    // - MSG91 (popular in India)
    // - Twilio
    // - AWS SNS
    // - TextLocal
    
    // For now, we'll simulate success and log the message
    // To enable real SMS, add your SMS provider's API key as a secret

    return new Response(
      JSON.stringify({ 
        success: true,
        phone: formattedPhone,
        message: smsContent,
        note: "SMS logged. Connect an SMS provider (MSG91, Twilio) to send real messages."
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("SMS notification error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
