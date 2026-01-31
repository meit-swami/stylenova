import { useState, useCallback, useRef, useEffect } from 'react';
import { useConversation } from '@elevenlabs/react';
import { supabase } from '@/integrations/supabase/client';
import { useBrowserSpeech } from './useBrowserSpeech';
import { toast } from 'sonner';

interface UseConversationalAIOptions {
  language?: 'english' | 'hindi' | 'hinglish';
  onMessage?: (message: { role: 'user' | 'assistant'; text: string }) => void;
  agentId?: string; // Optional ElevenLabs agent ID for public agents
}

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';

export function useConversationalAI({ 
  language = 'hinglish',
  onMessage,
  agentId,
}: UseConversationalAIOptions = {}) {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [useFallback, setUseFallback] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([]);
  const [error, setError] = useState<string | null>(null);
  const isProcessingRef = useRef(false);

  // Browser-based fallback
  const browserSpeech = useBrowserSpeech({
    language,
    onResult: async (transcript) => {
      if (useFallback && transcript.trim()) {
        await handleUserMessage(transcript);
      }
    },
    onError: (err) => console.warn('Browser speech error:', err),
  });

  // ElevenLabs Conversational AI
  const elevenLabsConversation = useConversation({
    onConnect: () => {
      setStatus('connected');
      setError(null);
      toast.success('Voice chat connected');
    },
    onDisconnect: () => {
      setStatus('disconnected');
    },
    onMessage: (message: any) => {
      if (message.type === 'user_transcript') {
        const userText = message.user_transcription_event?.user_transcript || '';
        if (userText) {
          addMessage('user', userText);
        }
      } else if (message.type === 'agent_response') {
        const agentText = message.agent_response_event?.agent_response || '';
        if (agentText) {
          addMessage('assistant', agentText);
        }
      }
    },
    onError: (err: any) => {
      console.error('ElevenLabs conversation error:', err);
      setError(err.message || 'Connection failed');
      handleFallback();
    },
  });

  const addMessage = useCallback((role: 'user' | 'assistant', text: string) => {
    const msg = { role, text };
    setMessages(prev => [...prev, msg]);
    onMessage?.(msg);
  }, [onMessage]);

  // Handle fallback to browser speech
  const handleFallback = useCallback(() => {
    setUseFallback(true);
    setStatus('connected');
    toast.info('Using browser voice (free fallback mode)');
  }, []);

  // Process user message with AI (fallback mode)
  const handleUserMessage = useCallback(async (text: string) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    addMessage('user', text);

    try {
      // Get AI response
      const { data, error: aiError } = await supabase.functions.invoke('ai-assistant', {
        body: {
          type: 'voice_chat',
          context: { message: text },
          language,
        },
      });

      if (aiError) throw aiError;

      const response = data?.content || "I'm sorry, I couldn't process that. Could you try again?";
      addMessage('assistant', response);
      
      // Speak the response
      browserSpeech.speak(response);
    } catch (err: any) {
      console.error('AI response error:', err);
      const fallbackResponse = language === 'hindi' 
        ? 'क्षमा करें, कुछ गड़बड़ हुई। कृपया पुनः प्रयास करें।'
        : "Sorry, something went wrong. Please try again.";
      addMessage('assistant', fallbackResponse);
      browserSpeech.speak(fallbackResponse);
    } finally {
      isProcessingRef.current = false;
    }
  }, [language, addMessage, browserSpeech]);

  // Start conversation
  const startConversation = useCallback(async () => {
    setStatus('connecting');
    setError(null);
    setMessages([]);

    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Try to get token from edge function
      const { data, error: tokenError } = await supabase.functions.invoke('elevenlabs-conversation-token');

      if (tokenError || !data?.token) {
        console.warn('Failed to get ElevenLabs token, using fallback');
        handleFallback();
        return;
      }

      // Start ElevenLabs conversation
      await elevenLabsConversation.startSession({
        conversationToken: data.token,
      });
    } catch (err: any) {
      console.error('Failed to start conversation:', err);
      
      // Check if it's a quota/auth error
      if (err.message?.includes('quota') || err.message?.includes('401') || err.message?.includes('403')) {
        handleFallback();
      } else {
        setError(err.message || 'Failed to start conversation');
        setStatus('disconnected');
        toast.error('Failed to start voice chat. Please try again.');
      }
    }
  }, [agentId, elevenLabsConversation, handleFallback]);

  // Stop conversation
  const stopConversation = useCallback(async () => {
    if (useFallback) {
      browserSpeech.stopListening();
      browserSpeech.stopSpeaking();
    } else {
      await elevenLabsConversation.endSession();
    }
    setStatus('disconnected');
    setUseFallback(false);
  }, [useFallback, browserSpeech, elevenLabsConversation]);

  // Toggle listening in fallback mode
  const toggleListening = useCallback(() => {
    if (!useFallback) return;
    
    if (browserSpeech.isListening) {
      browserSpeech.stopListening();
    } else {
      browserSpeech.startListening();
    }
  }, [useFallback, browserSpeech]);

  // Send text message (works in both modes)
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    if (useFallback) {
      await handleUserMessage(text);
    } else {
      elevenLabsConversation.sendUserMessage(text);
    }
  }, [useFallback, handleUserMessage, elevenLabsConversation]);

  // Check if using premium (ElevenLabs) or free (browser) mode
  const isPremiumMode = !useFallback && status === 'connected';
  const isFreeMode = useFallback && status === 'connected';

  return {
    // Connection
    startConversation,
    stopConversation,
    status,
    error,
    
    // Messaging
    messages,
    sendMessage,
    
    // Voice controls (fallback mode)
    toggleListening,
    isListening: browserSpeech.isListening,
    isSpeaking: useFallback ? browserSpeech.isSpeaking : elevenLabsConversation.isSpeaking,
    transcript: browserSpeech.transcript,
    
    // Mode info
    isPremiumMode,
    isFreeMode,
    useFallback,
    
    // Browser speech support
    isSupported: browserSpeech.isSupported,
  };
}
