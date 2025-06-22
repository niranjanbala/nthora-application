import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface IndustryRequest {
  text: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text }: IndustryRequest = await req.json()

    if (!text || text.length < 5) {
      return new Response(
        JSON.stringify({ error: 'Text must be at least 5 characters long' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const prompt = `
Analyze the following text describing an industry, company, or business context and extract:

1. Primary industries (1-3 main industry categories)
2. Secondary industries (1-3 related or supporting industries)
3. Business model (subscription, marketplace, b2b, b2c, enterprise, services, etc.)
4. Company stage (startup, growth stage, public company, enterprise, etc.)
5. Suggested related industries (3-5 industries that might be relevant)
6. Confidence score (0.0-1.0 based on clarity and specificity)

Text: "${text}"

Respond in JSON format:
{
  "primaryIndustries": ["SaaS", "Fintech"],
  "secondaryIndustries": ["Enterprise Software"],
  "businessModel": ["Subscription", "B2B"],
  "companyStage": ["Startup"],
  "suggestedIndustries": ["Cloud Computing", "Financial Services", "Banking"],
  "confidence": 0.85
}`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at analyzing business contexts and industry classifications. Extract accurate industry information from descriptions. Be specific and use standard industry terminology.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return new Response(
        JSON.stringify({ error: errorData.error?.message || `OpenAI API error: ${response.status}` }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const data = await response.json()
    const content = data.choices[0].message.content

    try {
      const parsed = JSON.parse(content)
      const result = {
        primaryIndustries: parsed.primaryIndustries || [],
        secondaryIndustries: parsed.secondaryIndustries || [],
        businessModel: parsed.businessModel || [],
        companyStage: parsed.companyStage || [],
        suggestedIndustries: parsed.suggestedIndustries || [],
        confidence: parsed.confidence || 0.5,
        tags: [...(parsed.primaryIndustries || []), ...(parsed.secondaryIndustries || [])],
      }

      return new Response(
        JSON.stringify(result),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    } catch (parseError) {
      return new Response(
        JSON.stringify({ error: 'Failed to parse OpenAI response' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})