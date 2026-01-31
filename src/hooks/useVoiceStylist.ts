import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UseVoiceStylistOptions {
  language?: 'english' | 'hindi' | 'hinglish';
  preferFree?: boolean; // Force browser TTS to save API costs
}

// Browser TTS language codes
const BROWSER_LANG_CODES = {
  english: 'en-US',
  hindi: 'hi-IN',
  hinglish: 'hi-IN',
};

export function useVoiceStylist({ 
  language = 'hinglish',
  preferFree = false,
}: UseVoiceStylistOptions = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [useFallback, setUseFallback] = useState(preferFree);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Auto-switch to fallback after 2 failed API attempts
  useEffect(() => {
    if (failedAttempts >= 2 && !useFallback) {
      setUseFallback(true);
      toast.info('Switched to free voice mode (browser-based)');
    }
  }, [failedAttempts, useFallback]);

  // Browser-based TTS (free fallback)
  const speakWithBrowser = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) {
      toast.error('Browser does not support speech synthesis');
      return;
    }

    // Stop any current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = BROWSER_LANG_CODES[language] || 'en-US';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Try to find a good voice
    const voices = window.speechSynthesis.getVoices();
    const langCode = BROWSER_LANG_CODES[language] || 'en-US';
    const matchingVoice = voices.find(v => v.lang.startsWith(langCode.split('-')[0]));
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
      setIsSpeaking(false);
      toast.error('Failed to speak');
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [language]);

  // ElevenLabs TTS (premium)
  const speakWithElevenLabs = useCallback(async (text: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text, language },
      });

      if (error) throw error;

      if (!data?.audioContent) {
        throw new Error('No audio content received');
      }

      // Create audio element and play
      const audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      return new Promise((resolve) => {
        audio.onplay = () => setIsSpeaking(true);
        audio.onended = () => {
          setIsSpeaking(false);
          audioRef.current = null;
          resolve(true);
        };
        audio.onerror = () => {
          setIsSpeaking(false);
          audioRef.current = null;
          resolve(false);
        };
        audio.play().catch(() => resolve(false));
      });
    } catch (error: any) {
      console.error('ElevenLabs TTS error:', error);
      
      // Check for quota/rate limit errors
      if (error.message?.includes('429') || error.message?.includes('quota') || error.message?.includes('limit')) {
        setFailedAttempts(prev => prev + 2); // Force immediate fallback
      } else {
        setFailedAttempts(prev => prev + 1);
      }
      
      return false;
    }
  }, [language]);

  // Main speak function with automatic fallback
  const speak = useCallback(async (text: string) => {
    if (!text || text.trim().length === 0) return;

    // Stop any current playback
    stop();

    setIsLoading(true);

    try {
      if (useFallback || preferFree) {
        // Use browser TTS directly
        speakWithBrowser(text);
      } else {
        // Try ElevenLabs first
        const success = await speakWithElevenLabs(text);
        
        if (!success) {
          // Fallback to browser TTS
          console.log('Falling back to browser TTS');
          speakWithBrowser(text);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [useFallback, preferFree, speakWithBrowser, speakWithElevenLabs]);

  // Stop speaking
  const stop = useCallback(() => {
    // Stop ElevenLabs audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    
    // Stop browser TTS
    window.speechSynthesis?.cancel();
    
    setIsSpeaking(false);
  }, []);

  // Reset to try premium again
  const resetFallback = useCallback(() => {
    setUseFallback(preferFree);
    setFailedAttempts(0);
  }, [preferFree]);

  // Force free mode
  const setFreeMode = useCallback((enabled: boolean) => {
    setUseFallback(enabled);
  }, []);

  return {
    speak,
    stop,
    isSpeaking,
    isLoading,
    // Fallback status
    useFallback,
    setFreeMode,
    resetFallback,
    // Mode indicators
    isPremiumMode: !useFallback,
    isFreeMode: useFallback,
  };
}
