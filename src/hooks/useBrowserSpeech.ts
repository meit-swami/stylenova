import { useState, useCallback, useRef, useEffect } from 'react';

interface UseBrowserSpeechOptions {
  language?: 'english' | 'hindi' | 'hinglish';
  onResult?: (transcript: string) => void;
  onError?: (error: string) => void;
}

// Language codes for Web Speech API
const LANGUAGE_CODES = {
  english: 'en-US',
  hindi: 'hi-IN',
  hinglish: 'hi-IN', // Use Hindi, browser will handle mixed speech
};

// Voice names to prefer (these are commonly available)
const PREFERRED_VOICES = {
  english: ['Google UK English Female', 'Microsoft Zira', 'Samantha'],
  hindi: ['Google हिन्दी', 'Microsoft Hemant', 'Lekha'],
  hinglish: ['Google हिन्दी', 'Google UK English Female'],
};

export function useBrowserSpeech({ 
  language = 'hinglish', 
  onResult, 
  onError 
}: UseBrowserSpeechOptions = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Check browser support
  useEffect(() => {
    const hasSpeechSynthesis = 'speechSynthesis' in window;
    const hasSpeechRecognition = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
    setIsSupported(hasSpeechSynthesis && hasSpeechRecognition);
  }, []);

  // Get the best available voice for the language
  const getVoice = useCallback((lang: string): SpeechSynthesisVoice | null => {
    const voices = window.speechSynthesis.getVoices();
    const preferredNames = PREFERRED_VOICES[lang as keyof typeof PREFERRED_VOICES] || [];
    
    // Try to find a preferred voice
    for (const name of preferredNames) {
      const voice = voices.find(v => v.name.includes(name));
      if (voice) return voice;
    }
    
    // Fall back to any voice matching the language code
    const langCode = LANGUAGE_CODES[lang as keyof typeof LANGUAGE_CODES] || 'en-US';
    const langVoice = voices.find(v => v.lang.startsWith(langCode.split('-')[0]));
    if (langVoice) return langVoice;
    
    // Final fallback to first available voice
    return voices[0] || null;
  }, []);

  // Text-to-Speech using browser's SpeechSynthesis
  const speak = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) {
      onError?.('Speech synthesis not supported');
      return;
    }

    // Stop any current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = LANGUAGE_CODES[language] || 'en-US';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Get and set voice
    const voice = getVoice(language);
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (event) => {
      setIsSpeaking(false);
      onError?.(`Speech error: ${event.error}`);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [language, getVoice, onError]);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  // Speech-to-Text using browser's SpeechRecognition
  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      onError?.('Speech recognition not supported');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = LANGUAGE_CODES[language] || 'en-US';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      const fullTranscript = finalTranscript || interimTranscript;
      setTranscript(fullTranscript);
      
      if (finalTranscript) {
        onResult?.(finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      onError?.(`Recognition error: ${event.error}`);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [language, onResult, onError]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      recognitionRef.current?.stop();
    };
  }, []);

  return {
    // TTS
    speak,
    stopSpeaking,
    isSpeaking,
    
    // STT
    startListening,
    stopListening,
    isListening,
    transcript,
    
    // Status
    isSupported,
  };
}
