import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IconMicrophone,
  IconMicrophoneOff,
  IconPlayerStop,
  IconSend,
  IconX,
  IconVolume,
  IconVolumeOff,
  IconSparkles,
  IconCoin,
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useConversationalAI } from '@/hooks/useConversationalAI';

interface VoiceChatProps {
  language?: 'english' | 'hindi' | 'hinglish';
  onClose?: () => void;
  className?: string;
}

export function VoiceChat({ 
  language = 'hinglish', 
  onClose,
  className = '',
}: VoiceChatProps) {
  const [textInput, setTextInput] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);

  const {
    startConversation,
    stopConversation,
    status,
    messages,
    sendMessage,
    toggleListening,
    isListening,
    isSpeaking,
    transcript,
    isPremiumMode,
    isFreeMode,
    isSupported,
  } = useConversationalAI({ language });

  const isConnected = status === 'connected';
  const isConnecting = status === 'connecting';

  // Auto-scroll to latest message
  useEffect(() => {
    const container = document.getElementById('voice-chat-messages');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  const handleSendText = () => {
    if (textInput.trim()) {
      sendMessage(textInput);
      setTextInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={`bg-card border border-border rounded-2xl shadow-lg overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isSpeaking 
                ? 'bg-primary animate-pulse' 
                : isConnected 
                  ? 'bg-primary/20' 
                  : 'bg-muted'
            }`}>
              {isSpeaking ? (
                <IconVolume className="w-5 h-5 text-primary-foreground" />
              ) : (
                <IconSparkles className="w-5 h-5 text-primary" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-foreground">AI Fashion Stylist</h3>
              <div className="flex items-center gap-2">
                <span className={`text-xs ${isConnected ? 'text-green-500' : 'text-muted-foreground'}`}>
                  {isConnecting ? 'Connecting...' : isConnected ? 'Connected' : 'Disconnected'}
                </span>
                {isConnected && (
                  <Badge variant={isPremiumMode ? 'default' : 'secondary'} className="text-[10px] px-1.5 py-0">
                    {isPremiumMode ? (
                      <>
                        <IconSparkles className="w-2.5 h-2.5 mr-0.5" />
                        Premium
                      </>
                    ) : (
                      <>
                        <IconCoin className="w-2.5 h-2.5 mr-0.5" />
                        Free
                      </>
                    )}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <IconX className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="h-64 p-4" id="voice-chat-messages">
        <div className="space-y-3">
          {messages.length === 0 && isConnected && (
            <div className="text-center text-muted-foreground text-sm py-8">
              {isFreeMode ? (
                <>
                  <p>🎤 Tap the microphone to speak</p>
                  <p className="text-xs mt-1">Or type your message below</p>
                </>
              ) : (
                <>
                  <p>🎙️ Start speaking - I'm listening!</p>
                  <p className="text-xs mt-1">Ask me anything about fashion</p>
                </>
              )}
            </div>
          )}

          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                    : 'bg-muted text-foreground rounded-bl-sm'
                }`}
              >
                <p className="text-sm">{msg.text}</p>
              </div>
            </motion.div>
          ))}

          {/* Live transcript indicator */}
          {transcript && isListening && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-end"
            >
              <div className="max-w-[80%] rounded-2xl px-4 py-2 bg-primary/50 text-primary-foreground rounded-br-sm">
                <p className="text-sm italic">{transcript}...</p>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Controls */}
      <div className="p-4 border-t border-border bg-muted/30">
        {!isConnected ? (
          <Button
            variant="gold"
            size="lg"
            className="w-full"
            onClick={startConversation}
            disabled={isConnecting || !isSupported}
          >
            {isConnecting ? (
              <>
                <span className="animate-pulse">Connecting...</span>
              </>
            ) : !isSupported ? (
              'Voice not supported in this browser'
            ) : (
              <>
                <IconMicrophone className="w-5 h-5" />
                Start Voice Chat
              </>
            )}
          </Button>
        ) : (
          <div className="space-y-3">
            {/* Text input toggle */}
            <AnimatePresence>
              {showTextInput && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="flex gap-2"
                >
                  <Input
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1"
                  />
                  <Button onClick={handleSendText} disabled={!textInput.trim()}>
                    <IconSend className="w-4 h-4" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Voice controls */}
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTextInput(!showTextInput)}
              >
                {showTextInput ? 'Hide' : 'Type'}
              </Button>

              {/* Main mic button - only for free mode */}
              {isFreeMode && (
                <Button
                  variant={isListening ? 'destructive' : 'default'}
                  size="lg"
                  className="rounded-full w-16 h-16"
                  onClick={toggleListening}
                >
                  {isListening ? (
                    <IconMicrophoneOff className="w-7 h-7" />
                  ) : (
                    <IconMicrophone className="w-7 h-7" />
                  )}
                </Button>
              )}

              {/* Speaking indicator for premium mode */}
              {isPremiumMode && (
                <div className={`rounded-full w-16 h-16 flex items-center justify-center ${
                  isSpeaking ? 'bg-primary animate-pulse' : 'bg-muted'
                }`}>
                  {isSpeaking ? (
                    <IconVolume className="w-7 h-7 text-primary-foreground" />
                  ) : (
                    <IconMicrophone className="w-7 h-7 text-muted-foreground" />
                  )}
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={stopConversation}
              >
                <IconPlayerStop className="w-4 h-4" />
                End
              </Button>
            </div>

            {/* Mode indicator */}
            <p className="text-center text-xs text-muted-foreground">
              {isFreeMode 
                ? '🆓 Free mode: Using browser voice (no API costs)'
                : '✨ Premium mode: Using ElevenLabs AI voice'
              }
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
