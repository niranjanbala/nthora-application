import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface QuestionRequest {
  title: string;
  content: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { title, content }: QuestionRequest = await req.json()

    if (!title || !content) {
      return new Response(
        JSON.stringify({ error: 'Both title and content are required' }),
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
Analyze this question and extract:

1. Primary tags (3-5 main topics/domains)
2. Secondary tags (2-4 related topics)
3. Expected answer type (tactical, strategic, resource, introduction, brainstorming)
4. Urgency level (low, medium, high, urgent)
5. Brief summary (1-2 sentences)
6. Confidence score (0.0-1.0)

Title: "${title}"
Content: "${content}"

Respond in JSON format:
{
  "primaryTags": ["Product Management", "Strategy"],
  "secondaryTags": ["Startups", "SaaS"],
  "expectedAnswerType": "strategic",
  "urgencyLevel": "medium",
  "summary": "Question about product strategy for a SaaS startup",
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
            content: 'You are an expert at analyzing questions and categorizing them for expert matching. Be precise and helpful.'
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
    const content_response = data.choices[0].message.content

    try {
      const parsed = JSON.parse(content_response)
      const result = {
        primaryTags: parsed.primaryTags || [],
        secondaryTags: parsed.secondaryTags || [],
        expectedAnswerType: parsed.expectedAnswerType || 'tactical',
        urgencyLevel: parsed.urgencyLevel || 'medium',
        summary: parsed.summary || '',
        confidence: parsed.confidence || 0.5,
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