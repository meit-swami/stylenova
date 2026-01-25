import { useState } from 'react';
import { motion } from 'framer-motion';
import { IconUser, IconPhone, IconArrowRight, IconArrowLeft } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface KioskCustomerFormProps {
  onSubmit: (name: string, phone: string) => void;
  onBack: () => void;
  language: 'english' | 'hindi' | 'hinglish';
  isLoading?: boolean;
}

const translations = {
  english: {
    title: 'Save Your Wishlist 💝',
    subtitle: 'Enter your details to save and share your favorite picks',
    name: 'Your Name',
    namePlaceholder: 'Enter your name',
    phone: 'Phone Number',
    phonePlaceholder: 'Enter 10-digit mobile number',
    save: 'Save & Get QR',
    back: 'Back',
    required: 'Both fields are required',
    invalidPhone: 'Please enter a valid 10-digit phone number',
  },
  hindi: {
    title: 'अपनी विशलिस्ट सेव करें 💝',
    subtitle: 'अपनी पसंद सेव और शेयर करने के लिए विवरण दर्ज करें',
    name: 'आपका नाम',
    namePlaceholder: 'अपना नाम दर्ज करें',
    phone: 'फोन नंबर',
    phonePlaceholder: '10 अंकों का मोबाइल नंबर दर्ज करें',
    save: 'सेव करें और QR पाएं',
    back: 'वापस',
    required: 'दोनों फ़ील्ड आवश्यक हैं',
    invalidPhone: 'कृपया 10 अंकों का वैध फोन नंबर दर्ज करें',
  },
  hinglish: {
    title: 'Apni Wishlist Save Karo 💝',
    subtitle: 'Apni favorite picks save aur share karne ke liye details dalo',
    name: 'Aapka Naam',
    namePlaceholder: 'Apna naam daalo',
    phone: 'Phone Number',
    phonePlaceholder: '10-digit mobile number daalo',
    save: 'Save Karo & QR Lo',
    back: 'Back',
    required: 'Dono fields zaroori hain',
    invalidPhone: 'Please 10 digit ka valid phone number daalo',
  },
};

export function KioskCustomerForm({
  onSubmit,
  onBack,
  language,
  isLoading,
}: KioskCustomerFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const t = translations[language];

  const handleSubmit = () => {
    setError('');

    if (!name.trim() || !phone.trim()) {
      setError(t.required);
      return;
    }

    // Validate Indian phone number (10 digits)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      setError(t.invalidPhone);
      return;
    }

    onSubmit(name.trim(), phone.trim());
  };

  return (
    <motion.div
      key="customer-form"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="max-w-md mx-auto px-4"
    >
      <div className="text-center mb-8">
        <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">
          {t.title}
        </h2>
        <p className="opacity-70">{t.subtitle}</p>
      </div>

      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 md:p-8 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="customerName" className="text-white flex items-center gap-2">
            <IconUser className="w-4 h-4" />
            {t.name}
          </Label>
          <Input
            id="customerName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.namePlaceholder}
            className="h-12 text-lg bg-white/10 border-white/20 text-white placeholder:text-white/50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="customerPhone" className="text-white flex items-center gap-2">
            <IconPhone className="w-4 h-4" />
            {t.phone}
          </Label>
          <Input
            id="customerPhone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
            placeholder={t.phonePlaceholder}
            className="h-12 text-lg bg-white/10 border-white/20 text-white placeholder:text-white/50"
          />
        </div>

        {error && (
          <p className="text-destructive text-sm text-center">{error}</p>
        )}

        <div className="flex gap-3 pt-4">
          <Button
            variant="glass"
            size="xl"
            onClick={onBack}
            className="flex-1 touch-manipulation"
          >
            <IconArrowLeft className="w-5 h-5" />
            {t.back}
          </Button>
          <Button
            variant="gold"
            size="xl"
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 touch-manipulation"
          >
            {isLoading ? (
              <span className="animate-pulse">Saving...</span>
            ) : (
              <>
                {t.save}
                <IconArrowRight className="w-5 h-5" />
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
