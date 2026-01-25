import { motion } from 'framer-motion';
import { IconSparkles, IconCamera } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';

interface KioskWelcomeProps {
  onStart: () => void;
  language: 'english' | 'hindi' | 'hinglish';
  onLanguageChange: (lang: 'english' | 'hindi' | 'hinglish') => void;
}

const translations = {
  english: {
    title: 'Welcome to StyleNova ✨',
    subtitle: 'Try on outfits virtually and discover your perfect look!',
    button: 'Start Your Experience',
  },
  hindi: {
    title: 'StyleNova में आपका स्वागत है ✨',
    subtitle: 'वर्चुअली कपड़े ट्राई करें और अपना परफेक्ट लुक खोजें!',
    button: 'अनुभव शुरू करें',
  },
  hinglish: {
    title: 'StyleNova mein Swagat hai ✨',
    subtitle: 'Virtually outfits try karo aur apna perfect look dhoondho!',
    button: 'Start Karo',
  },
};

export function KioskWelcome({ onStart, language, onLanguageChange }: KioskWelcomeProps) {
  const t = translations[language];

  return (
    <motion.div
      key="welcome"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4"
    >
      <motion.div
        className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-gradient-to-br from-secondary to-amber-400 flex items-center justify-center mb-6 md:mb-8 shadow-gold"
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        <IconSparkles className="w-12 h-12 md:w-16 md:h-16" />
      </motion.div>

      <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
        {t.title}
      </h2>
      <p className="text-lg md:text-xl opacity-70 max-w-md mb-8 md:mb-12">
        {t.subtitle}
      </p>

      <Button
        variant="gold"
        size="xl"
        className="text-lg md:text-xl px-8 md:px-12 py-5 md:py-6 h-auto touch-manipulation"
        onClick={onStart}
      >
        <IconCamera className="w-6 h-6 md:w-7 md:h-7" />
        {t.button}
      </Button>

      {/* Language Options */}
      <div className="flex gap-3 md:gap-4 mt-8 md:mt-12 flex-wrap justify-center">
        {(['english', 'hindi', 'hinglish'] as const).map((lang) => (
          <button
            key={lang}
            onClick={() => onLanguageChange(lang)}
            className={`px-5 md:px-6 py-2.5 md:py-2 rounded-full backdrop-blur-md transition-colors text-sm md:text-base touch-manipulation ${
              language === lang
                ? 'bg-primary text-primary-foreground'
                : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            {lang === 'english' ? 'English' : lang === 'hindi' ? 'हिंदी' : 'Hinglish'}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
