import { motion } from 'framer-motion';
import { IconArrowLeft, IconQrcode, IconX, IconShare } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image: string;
}

interface KioskWishlistProps {
  items: WishlistItem[];
  onRemoveItem: (id: string) => void;
  onBack: () => void;
  onGenerateQR: () => void;
  language: 'english' | 'hindi' | 'hinglish';
}

const translations = {
  english: {
    title: 'Your Wishlist ❤️',
    empty: 'Your wishlist is empty',
    emptySubtitle: 'Try on some outfits and add your favorites!',
    continue: 'Continue Shopping',
    getQR: 'Get QR & Share',
  },
  hindi: {
    title: 'आपकी विशलिस्ट ❤️',
    empty: 'आपकी विशलिस्ट खाली है',
    emptySubtitle: 'कुछ आउटफिट्स ट्राई करें और पसंदीदा जोड़ें!',
    continue: 'शॉपिंग जारी रखें',
    getQR: 'QR लें और शेयर करें',
  },
  hinglish: {
    title: 'Aapki Wishlist ❤️',
    empty: 'Aapki wishlist khali hai',
    emptySubtitle: 'Kuch outfits try karo aur favorites add karo!',
    continue: 'Shopping Jaari Rakho',
    getQR: 'QR Lo aur Share Karo',
  },
};

export function KioskWishlist({
  items,
  onRemoveItem,
  onBack,
  onGenerateQR,
  language,
}: KioskWishlistProps) {
  const t = translations[language];

  return (
    <motion.div
      key="wishlist"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="max-w-3xl mx-auto px-4"
    >
      <h2 className="font-display text-2xl md:text-3xl font-bold text-center mb-6 md:mb-8">
        {t.title}
      </h2>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💔</div>
          <p className="text-xl opacity-70 mb-2">{t.empty}</p>
          <p className="opacity-50">{t.emptySubtitle}</p>
        </div>
      ) : (
        <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
          {items.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-white/10 backdrop-blur-xl rounded-xl md:rounded-2xl p-4 md:p-6 flex items-center gap-4 md:gap-6"
            >
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg"
                />
              ) : (
                <div className="w-16 h-16 md:w-20 md:h-20 bg-white/10 rounded-lg flex items-center justify-center text-3xl md:text-5xl">
                  👗
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base md:text-lg truncate">{item.name}</h3>
                <p className="opacity-70 text-sm md:text-base">₹{item.price.toLocaleString()}</p>
              </div>
              <button
                onClick={() => onRemoveItem(item.id)}
                className="p-3 rounded-xl hover:bg-white/20 transition-colors touch-manipulation"
              >
                <IconX className="w-5 h-5" />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
        <Button variant="glass" size="xl" onClick={onBack} className="touch-manipulation">
          <IconArrowLeft className="w-5 h-5" />
          {t.continue}
        </Button>
        {items.length > 0 && (
          <Button variant="gold" size="xl" onClick={onGenerateQR} className="touch-manipulation">
            <IconQrcode className="w-5 h-5" />
            {t.getQR}
          </Button>
        )}
      </div>
    </motion.div>
  );
}
