import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface STTRequest {
  audioBase64: string;
  mimeType?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { audioBase64, mimeType = 'audio/webm' }: STTRequest = await req.json()

    if (!audioBase64) {
      return new Response(
        JSON.stringify({ error: 'Audio data is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const elevenLabsApiKey = Deno.env.get('ELEVENLABS_API_KEY_STT')
    if (!elevenLabsApiKey) {
      return new Response(
        JSON.stringify({ error: 'ElevenLabs STT API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // --- Start Debugging Logs ---
    console.log('Received audioBase64 length:', audioBase64.length);
    // --- End Debugging Logs ---

    // Convert base64 to binary
    const binaryString = atob(audioBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // --- Start Debugging Logs ---
    console.log('Bytes array length:', bytes.length);
    // --- End Debugging Logs ---

    // Create a File object from the binary data
    // Using File instead of Blob to be more explicit for FormData
    const audioFile = new File([bytes.buffer], 'recording.webm', { type: mimeType });
    
    // --- Start Debugging Logs ---
    console.log('Audio File name:', audioFile.name);
    console.log('Audio File type:', audioFile.type);
    console.log('Audio File size:', audioFile.size);
    // --- End Debugging Logs ---

    // Create a FormData object to send the audio file
    const formData = new FormData();
    formData.append('file', audioFile); // ElevenLabs API expects 'file' parameter
    formData.append('model_id', 'scribe_v1'); // ElevenLabs uses 'scribe_v1' model, not 'whisper-1'
    
    // --- Start Debugging Logs ---
    console.log('FormData entries:');
    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }
    // --- End Debugging Logs ---

    // Call ElevenLabs API to convert speech to text
    const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
      method: 'POST',
      headers: {
        'xi-api-key': elevenLabsApiKey
        // Do NOT set 'Content-Type' header for FormData, fetch handles it automatically
      },
      body: formData
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      let errorData = {}
      try {
        errorData = JSON.parse(errorText)
      } catch (e) {
        // If it's not JSON, keep as text
        errorData = { message: errorText }
      }
      
      // --- Start Debugging Logs ---
      console.error('ElevenLabs API response not OK:', response.status);
      console.error('Response headers:', Object.fromEntries(response.headers.entries()));
      console.error('Response body:', errorText);
      console.error('Parsed error data:', errorData);
      // --- End Debugging Logs ---
      
      return new Response(
        JSON.stringify({ 
          error: errorData.detail?.message || errorData.message || `ElevenLabs API error: ${response.status}`,
          details: errorData,
          status: response.status
        }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const data = await response.json()
    
    return new Response(
      JSON.stringify({ success: true, text: data.text }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    // --- Start Debugging Logs ---
    console.error('Edge function caught error:', error);
    // --- End Debugging Logs ---
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})