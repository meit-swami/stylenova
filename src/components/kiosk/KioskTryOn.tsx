import { motion } from 'framer-motion';
import { 
  IconHeart, 
  IconShare, 
  IconQrcode, 
  IconArrowLeft, 
  IconArrowRight,
  IconSun,
  IconMoon,
  Icon360
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
}

interface KioskTryOnProps {
  product: Product;
  customerImage: string | null;
  onBack: () => void;
  onNext: () => void;
  onAddToWishlist: () => void;
  onShare: () => void;
  lightMode: boolean;
  onToggleLight: () => void;
  language: 'english' | 'hindi' | 'hinglish';
}

const translations = {
  english: {
    addWishlist: 'Add to Wishlist',
    share: 'Share This Look',
    qr: 'Generate QR Code',
    back: 'Back',
    next: 'Next Item',
    virtualTryOn: 'Virtual Try-On',
  },
  hindi: {
    addWishlist: 'विशलिस्ट में जोड़ें',
    share: 'यह लुक शेयर करें',
    qr: 'QR कोड बनाएं',
    back: 'वापस',
    next: 'अगला आइटम',
    virtualTryOn: 'वर्चुअल ट्राई-ऑन',
  },
  hinglish: {
    addWishlist: 'Wishlist mein Add karo',
    share: 'Look Share karo',
    qr: 'QR Code banao',
    back: 'Back',
    next: 'Next Item',
    virtualTryOn: 'Virtual Try-On',
  },
};

export function KioskTryOn({
  product,
  customerImage,
  onBack,
  onNext,
  onAddToWishlist,
  onShare,
  lightMode,
  onToggleLight,
  language,
}: KioskTryOnProps) {
  const t = translations[language];

  return (
    <motion.div
      key="tryon"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="max-w-5xl mx-auto px-4"
    >
      <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
        {/* Try-On Preview */}
        <div className="relative">
          <div className={`aspect-[3/4] rounded-2xl md:rounded-3xl flex items-center justify-center relative overflow-hidden ${
            lightMode 
              ? 'bg-gradient-to-br from-amber-50/50 to-orange-100/50' 
              : 'bg-gradient-to-br from-slate-700/50 to-slate-800/50'
          } backdrop-blur-xl`}>
            {customerImage ? (
              <div className="relative w-full h-full">
                <img 
                  src={customerImage} 
                  alt="Your look" 
                  className="absolute inset-0 w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="max-w-[60%] max-h-[60%] object-contain drop-shadow-2xl"
                  />
                </div>
              </div>
            ) : (
              <div className="text-center p-8">
                {product.image ? (
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full max-w-xs mx-auto mb-4 rounded-xl"
                  />
                ) : (
                  <div className="text-8xl md:text-9xl mb-4">👗</div>
                )}
                <p className="text-lg md:text-xl font-display font-bold">{t.virtualTryOn}</p>
              </div>
            )}

            {/* Light Controls */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
              <button
                onClick={onToggleLight}
                className={`p-3 rounded-xl transition-colors touch-manipulation ${
                  lightMode ? 'bg-secondary' : 'bg-white/20'
                }`}
              >
                {lightMode ? <IconSun className="w-5 h-5" /> : <IconMoon className="w-5 h-5" />}
              </button>
              <button className="p-3 rounded-xl bg-white/20 touch-manipulation">
                <Icon360 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col justify-center">
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">{product.name}</h2>
          <p className="text-xl md:text-2xl opacity-70 mb-6 md:mb-8">₹{product.price.toLocaleString()}</p>

          <div className="space-y-3 md:space-y-4">
            <Button variant="gold" size="xl" className="w-full touch-manipulation" onClick={onAddToWishlist}>
              <IconHeart className="w-5 h-5" />
              {t.addWishlist}
            </Button>
            <Button variant="glass" size="xl" className="w-full touch-manipulation" onClick={onShare}>
              <IconShare className="w-5 h-5" />
              {t.share}
            </Button>
            <Button variant="glass" size="xl" className="w-full touch-manipulation">
              <IconQrcode className="w-5 h-5" />
              {t.qr}
            </Button>
          </div>

          <div className="flex gap-3 md:gap-4 mt-6 md:mt-8">
            <Button
              variant="outline"
              className="flex-1 border-white/20 text-primary-foreground hover:bg-white/10 touch-manipulation"
              onClick={onBack}
            >
              <IconArrowLeft className="w-5 h-5" />
              {t.back}
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-white/20 text-primary-foreground hover:bg-white/10 touch-manipulation"
              onClick={onNext}
            >
              {t.next}
              <IconArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
