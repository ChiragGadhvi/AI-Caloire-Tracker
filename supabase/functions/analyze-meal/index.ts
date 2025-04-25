
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image } = await req.json();

    if (!image) {
      throw new Error("Image data is required");
    }

    console.log("Sending image to OpenAI for analysis...");
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a nutrition expert. Analyze the image and provide detailed information about the meal including its name, estimated calories, macronutrients (carbs, protein, fats in grams), and a health score from 1-10. Format your response as valid JSON with the following structure: {"name": "Meal Name", "calories": 500, "carbs": 50, "protein": 25, "fats": 15, "health_score": 7, "description": "Brief description of the meal."}'
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'What meal is shown in this image? Provide nutritional details.' },
              { type: 'image_url', image_url: { url: image } },
            ],
          },
        ],
        max_tokens: 500,
      }),
    });

    const data = await response.json();
    console.log("OpenAI response received:", data);
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error("Invalid response from OpenAI");
    }
    
    try {
      const analysisContent = data.choices[0].message.content.trim();
      console.log("Raw analysis content:", analysisContent);
      
      const jsonContent = analysisContent.replace(/```json|```/g, '').trim();
      const analysis = JSON.parse(jsonContent);
      
      console.log("Successfully parsed analysis:", analysis);
      return new Response(JSON.stringify(analysis), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (parseError) {
      console.error("Error parsing OpenAI response as JSON:", parseError);
      throw new Error("Failed to parse analysis results");
    }
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
