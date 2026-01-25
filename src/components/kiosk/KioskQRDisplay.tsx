import { motion } from 'framer-motion';
import { IconQrcode, IconShare, IconCheck, IconArrowLeft } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface KioskQRDisplayProps {
  shareUrl: string;
  customerName: string;
  itemCount: number;
  onBack: () => void;
  onNewSession: () => void;
  language: 'english' | 'hindi' | 'hinglish';
}

const translations = {
  english: {
    title: 'Your Wishlist is Saved! 🎉',
    subtitle: 'Scan the QR code or use the link below',
    scanQR: 'Scan with your phone camera',
    copyLink: 'Copy Link',
    copied: 'Link Copied!',
    items: 'items saved',
    thankYou: 'Thank you',
    newSession: 'Start New Session',
    back: 'Back to Wishlist',
  },
  hindi: {
    title: 'आपकी विशलिस्ट सेव हो गई! 🎉',
    subtitle: 'QR कोड स्कैन करें या नीचे दिए लिंक का उपयोग करें',
    scanQR: 'अपने फोन कैमरे से स्कैन करें',
    copyLink: 'लिंक कॉपी करें',
    copied: 'लिंक कॉपी हो गया!',
    items: 'आइटम सेव हुए',
    thankYou: 'धन्यवाद',
    newSession: 'नया सेशन शुरू करें',
    back: 'विशलिस्ट पर वापस',
  },
  hinglish: {
    title: 'Aapki Wishlist Save Ho Gayi! 🎉',
    subtitle: 'QR code scan karo ya neeche wala link use karo',
    scanQR: 'Apne phone camera se scan karo',
    copyLink: 'Link Copy Karo',
    copied: 'Link Copy Ho Gaya!',
    items: 'items save huye',
    thankYou: 'Shukriya',
    newSession: 'Naya Session Shuru Karo',
    back: 'Wishlist pe Wapas',
  },
};

export function KioskQRDisplay({
  shareUrl,
  customerName,
  itemCount,
  onBack,
  onNewSession,
  language,
}: KioskQRDisplayProps) {
  const t = translations[language];

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success(t.copied);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  // Generate QR code URL using a free QR API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`;

  return (
    <motion.div
      key="qr-display"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="max-w-md mx-auto px-4 text-center"
    >
      <div className="mb-6">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/20 flex items-center justify-center">
          <IconCheck className="w-8 h-8 text-success" />
        </div>
        <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">
          {t.title}
        </h2>
        <p className="opacity-70">{t.subtitle}</p>
      </div>

      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 md:p-8 mb-6">
        {/* Customer Info */}
        <div className="mb-4">
          <p className="text-lg">
            {t.thankYou}, <span className="font-semibold">{customerName}</span>! 🙏
          </p>
          <p className="text-sm opacity-70">
            {itemCount} {t.items}
          </p>
        </div>

        {/* QR Code */}
        <div className="bg-white rounded-xl p-4 inline-block mb-4">
          <img
            src={qrCodeUrl}
            alt="Wishlist QR Code"
            className="w-48 h-48 mx-auto"
          />
        </div>

        <p className="text-sm opacity-70 mb-4">{t.scanQR}</p>

        {/* Share URL */}
        <div className="bg-white/10 rounded-lg p-3 mb-4 break-all text-sm">
          {shareUrl}
        </div>

        <Button
          variant="glass"
          onClick={handleCopyLink}
          className="w-full touch-manipulation"
        >
          <IconShare className="w-5 h-5" />
          {t.copyLink}
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
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
          onClick={onNewSession}
          className="flex-1 touch-manipulation"
        >
          {t.newSession}
        </Button>
      </div>
    </motion.div>
  );
}
