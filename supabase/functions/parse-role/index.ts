import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RoleRequest {
  text: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text }: RoleRequest = await req.json()

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
Analyze the following role description and extract:

1. Primary role (most accurate job title)
2. Role level (junior, mid, senior, lead, executive)
3. Role type (individual_contributor, manager, director, founder, consultant)
4. Suggested similar roles (3-4 alternatives)
5. Industries mentioned or implied
6. Confidence score (0.0-1.0)

Text: "${text}"

Respond in JSON format:
{
  "primaryRole": "Product Manager",
  "roleLevel": "senior",
  "roleType": "individual_contributor",
  "suggestedRoles": ["Product Owner", "Product Lead"],
  "industries": ["SaaS", "Technology"],
  "confidence": 0.9
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
            content: 'You are an expert at analyzing professional roles and career levels. Extract accurate role information from descriptions. Use standard job titles and industry terminology.'
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
        primaryRole: parsed.primaryRole || '',
        roleLevel: parsed.roleLevel || 'mid',
        roleType: parsed.roleType || 'individual_contributor',
        suggestedRoles: parsed.suggestedRoles || [],
        industries: parsed.industries || [],
        confidence: parsed.confidence || 0.5,
        tags: [parsed.primaryRole, ...(parsed.suggestedRoles || [])].filter(Boolean),
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