import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { IconCamera, IconArrowLeft, IconLoader2 } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { useVirtualTryOn } from '@/hooks/useVirtualTryOn';

interface KioskCameraProps {
  onBack: () => void;
  onCapture: (imageData: string) => void;
  language: 'english' | 'hindi' | 'hinglish';
}

const translations = {
  english: {
    title: 'Let\'s capture your look',
    position: 'Position yourself in the frame',
    distance: 'Stand 3-4 feet away from the camera',
    back: 'Back',
    capture: 'Capture & Analyze',
    starting: 'Starting camera...',
  },
  hindi: {
    title: 'आइए आपका लुक कैप्चर करें',
    position: 'फ्रेम में खुद को पोजिशन करें',
    distance: 'कैमरे से 3-4 फीट दूर खड़े हों',
    back: 'वापस',
    capture: 'कैप्चर करें',
    starting: 'कैमरा शुरू हो रहा है...',
  },
  hinglish: {
    title: 'Aapka look capture karte hain',
    position: 'Frame mein khud ko position karo',
    distance: 'Camera se 3-4 feet door khade raho',
    back: 'Back',
    capture: 'Capture & Analyze',
    starting: 'Camera start ho raha hai...',
  },
};

export function KioskCamera({ onBack, onCapture, language }: KioskCameraProps) {
  const { videoRef, canvasRef, isCapturing, startCamera, stopCamera, captureImage } = useVirtualTryOn();
  const t = translations[language];

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const handleCapture = () => {
    const imageData = captureImage();
    if (imageData) {
      stopCamera();
      onCapture(imageData);
    }
  };

  return (
    <motion.div
      key="capture"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="max-w-4xl mx-auto px-4"
    >
      <h2 className="font-display text-2xl md:text-3xl font-bold text-center mb-6 md:mb-8">
        {t.title}
      </h2>

      {/* Camera Frame */}
      <div className="aspect-[4/3] bg-slate-800/50 backdrop-blur-xl rounded-2xl md:rounded-3xl border-2 border-dashed border-white/20 flex items-center justify-center relative overflow-hidden mb-6 md:mb-8">
        {isCapturing ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover transform -scale-x-100"
          />
        ) : (
          <div className="text-center">
            <IconLoader2 className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 opacity-50 animate-spin" />
            <p className="text-base md:text-lg opacity-70">{t.starting}</p>
          </div>
        )}

        {/* Corner Guides */}
        <div className="absolute top-4 md:top-8 left-4 md:left-8 w-12 md:w-16 h-12 md:h-16 border-t-4 border-l-4 border-white/30 rounded-tl-xl pointer-events-none" />
        <div className="absolute top-4 md:top-8 right-4 md:right-8 w-12 md:w-16 h-12 md:h-16 border-t-4 border-r-4 border-white/30 rounded-tr-xl pointer-events-none" />
        <div className="absolute bottom-4 md:bottom-8 left-4 md:left-8 w-12 md:w-16 h-12 md:h-16 border-b-4 border-l-4 border-white/30 rounded-bl-xl pointer-events-none" />
        <div className="absolute bottom-4 md:bottom-8 right-4 md:right-8 w-12 md:w-16 h-12 md:h-16 border-b-4 border-r-4 border-white/30 rounded-br-xl pointer-events-none" />

        {isCapturing && (
          <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md rounded-full px-4 py-2">
            <p className="text-xs md:text-sm text-white">{t.distance}</p>
          </div>
        )}
      </div>

      {/* Hidden canvas for capturing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Controls */}
      <div className="flex justify-center gap-3 md:gap-4">
        <Button 
          variant="glass" 
          size="xl" 
          onClick={onBack}
          className="touch-manipulation"
        >
          <IconArrowLeft className="w-5 h-5" />
          {t.back}
        </Button>
        <Button 
          variant="gold" 
          size="xl" 
          onClick={handleCapture}
          disabled={!isCapturing}
          className="touch-manipulation"
        >
          <IconCamera className="w-5 h-5" />
          {t.capture}
        </Button>
      </div>
    </motion.div>
  );
}
