import { supabase } from '../lib/supabase';

interface TTSResponse {
  success: boolean;
  audioUrl?: string;
  error?: string;
}

interface STTResponse {
  success: boolean;
  text?: string;
  error?: string;
}

class ElevenLabsService {
  /**
   * Convert text to speech using ElevenLabs API
   * @param text The text to convert to speech
   * @param voiceId Optional voice ID to use (defaults to a standard voice)
   * @returns Promise with audio URL or error
   */
  async textToSpeech(text: string, voiceId?: string): Promise<TTSResponse> {
    try {
      // Call the Supabase Edge Function for TTS
      const { data, error } = await supabase.functions.invoke('elevenlabs-tts', {
        body: { 
          text, 
          voiceId: voiceId || 'default' 
        }
      });

      if (error) {
        console.error('Error calling TTS function:', error);
        return { success: false, error: error.message };
      }

      if (!data || !data.audioUrl) {
        return { success: false, error: 'No audio URL returned' };
      }

      return { success: true, audioUrl: data.audioUrl };
    } catch (error) {
      console.error('Error in textToSpeech:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error in TTS service' 
      };
    }
  }

  /**
   * Convert speech to text using ElevenLabs API
   * @param audioBlob The audio blob to transcribe
   * @returns Promise with transcribed text or error
   */
  async speechToText(audioBlob: Blob): Promise<STTResponse> {
    try {
      // Convert blob to base64
      const base64Audio = await this.blobToBase64(audioBlob);
      
      // Call the Supabase Edge Function for STT
      const { data, error } = await supabase.functions.invoke('elevenlabs-stt', {
        body: { 
          audioBase64: base64Audio,
          mimeType: audioBlob.type
        }
      });

      if (error) {
        console.error('Error calling STT function:', error);
        return { success: false, error: error.message };
      }

      if (!data || !data.text) {
        return { success: false, error: 'No text returned from transcription' };
      }

      return { success: true, text: data.text };
    } catch (error) {
      console.error('Error in speechToText:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error in STT service' 
      };
    }
  }

  /**
   * Convert a Blob to base64 string
   * @param blob The blob to convert
   * @returns Promise with base64 string
   */
  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Remove the data URL prefix (e.g., "data:audio/webm;base64,")
        const base64 = base64String.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}

// Export singleton instance
export const elevenLabsService = new ElevenLabsService();