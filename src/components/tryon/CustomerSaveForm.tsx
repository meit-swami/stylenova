import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  IconUser,
  IconPhone,
  IconMapPin,
  IconCheck,
  IconLoader2,
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

export interface CustomerInfo {
  fullName: string;
  mobileNumber: string;
  address?: string;
}

interface CustomerSaveFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (customerInfo: CustomerInfo) => Promise<void>;
  language?: 'english' | 'hindi' | 'hinglish';
}

const translations = {
  english: {
    title: 'Save Your Look 💝',
    subtitle: 'Enter your details to save this try-on result',
    fullName: 'Full Name',
    fullNamePlaceholder: 'Enter your full name',
    mobile: 'Mobile Number',
    mobilePlaceholder: 'Enter 10-digit mobile number',
    address: 'Address (Optional)',
    addressPlaceholder: 'Enter your address for delivery...',
    save: 'Save My Look',
    cancel: 'Cancel',
    required: 'Name and mobile number are required',
    invalidPhone: 'Please enter a valid 10-digit phone number',
    saving: 'Saving...',
  },
  hindi: {
    title: 'अपना लुक सेव करें 💝',
    subtitle: 'इस ट्राई-ऑन रिजल्ट को सेव करने के लिए अपनी जानकारी दर्ज करें',
    fullName: 'पूरा नाम',
    fullNamePlaceholder: 'अपना पूरा नाम दर्ज करें',
    mobile: 'मोबाइल नंबर',
    mobilePlaceholder: '10 अंकों का मोबाइल नंबर दर्ज करें',
    address: 'पता (वैकल्पिक)',
    addressPlaceholder: 'डिलीवरी के लिए अपना पता दर्ज करें...',
    save: 'मेरा लुक सेव करें',
    cancel: 'रद्द करें',
    required: 'नाम और मोबाइल नंबर आवश्यक हैं',
    invalidPhone: 'कृपया 10 अंकों का वैध फोन नंबर दर्ज करें',
    saving: 'सेव हो रहा है...',
  },
  hinglish: {
    title: 'Apna Look Save Karo 💝',
    subtitle: 'Is try-on result ko save karne ke liye apni details daalo',
    fullName: 'Full Name',
    fullNamePlaceholder: 'Apna poora naam daalo',
    mobile: 'Mobile Number',
    mobilePlaceholder: '10-digit mobile number daalo',
    address: 'Address (Optional)',
    addressPlaceholder: 'Delivery ke liye apna address daalo...',
    save: 'Mera Look Save Karo',
    cancel: 'Cancel',
    required: 'Name aur mobile number zaroori hain',
    invalidPhone: 'Please 10 digit ka valid phone number daalo',
    saving: 'Save ho raha hai...',
  },
};

export function CustomerSaveForm({
  open,
  onOpenChange,
  onSave,
  language = 'hinglish',
}: CustomerSaveFormProps) {
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const t = translations[language];

  const handleSave = async () => {
    setError('');

    if (!fullName.trim() || !mobileNumber.trim()) {
      setError(t.required);
      return;
    }

    // Validate Indian phone number
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(mobileNumber.replace(/\s/g, ''))) {
      setError(t.invalidPhone);
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        fullName: fullName.trim(),
        mobileNumber: mobileNumber.trim(),
        address: address.trim() || undefined,
      });
      
      // Reset form
      setFullName('');
      setMobileNumber('');
      setAddress('');
      onOpenChange(false);
    } catch (err) {
      setError('Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-display">{t.title}</DialogTitle>
          <p className="text-sm text-muted-foreground">{t.subtitle}</p>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="flex items-center gap-2">
              <IconUser className="w-4 h-4" />
              {t.fullName}
            </Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={t.fullNamePlaceholder}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobileNumber" className="flex items-center gap-2">
              <IconPhone className="w-4 h-4" />
              {t.mobile}
            </Label>
            <Input
              id="mobileNumber"
              type="tel"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder={t.mobilePlaceholder}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="flex items-center gap-2">
              <IconMapPin className="w-4 h-4" />
              {t.address}
            </Label>
            <Textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={t.addressPlaceholder}
              rows={2}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t.cancel}
          </Button>
          <Button variant="gold" onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <IconLoader2 className="w-4 h-4 animate-spin" />
                {t.saving}
              </>
            ) : (
              <>
                <IconCheck className="w-4 h-4" />
                {t.save}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
