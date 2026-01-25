import { motion } from 'framer-motion';
import { IconRefresh, IconHeart, IconMicrophone } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  matchScore?: number;
}

interface KioskSuggestionsProps {
  products: Product[];
  aiComment: string;
  onRescan: () => void;
  onSelectProduct: (product: Product) => void;
  onViewWishlist: () => void;
  wishlistCount: number;
  language: 'english' | 'hindi' | 'hinglish';
}

const translations = {
  english: {
    title: 'AI-Curated For You ✨',
    subtitle: 'Based on your style profile',
    rescan: 'Re-scan',
    wishlist: 'View Wishlist',
    match: 'match',
  },
  hindi: {
    title: 'AI द्वारा आपके लिए चुने गए ✨',
    subtitle: 'आपकी स्टाइल प्रोफ़ाइल के आधार पर',
    rescan: 'फिर से स्कैन',
    wishlist: 'विशलिस्ट देखें',
    match: 'मैच',
  },
  hinglish: {
    title: 'AI ne Aapke Liye Chuna ✨',
    subtitle: 'Aapki style profile ke basis par',
    rescan: 'Re-scan',
    wishlist: 'Wishlist Dekho',
    match: 'match',
  },
};

export function KioskSuggestions({
  products,
  aiComment,
  onRescan,
  onSelectProduct,
  onViewWishlist,
  wishlistCount,
  language,
}: KioskSuggestionsProps) {
  const t = translations[language];

  return (
    <motion.div
      key="suggestions"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="px-4"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 gap-4">
        <div>
          <h2 className="font-display text-2xl md:text-3xl font-bold">{t.title}</h2>
          <p className="opacity-70">{t.subtitle}</p>
        </div>
        <div className="flex gap-3">
          <button className="p-3 rounded-xl bg-white/10 backdrop-blur-md hover:bg-white/20 transition-colors touch-manipulation">
            <IconMicrophone className="w-6 h-6" />
          </button>
          <Button variant="glass" onClick={onRescan} className="touch-manipulation">
            <IconRefresh className="w-5 h-5" />
            {t.rescan}
          </Button>
        </div>
      </div>

      {/* AI Voice Message */}
      <div className="bg-gradient-to-r from-primary/20 to-accent/20 backdrop-blur-xl rounded-2xl p-4 md:p-6 mb-6 md:mb-8">
        <p className="text-base md:text-lg italic">{aiComment}</p>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        {products.map((item) => (
          <motion.button
            key={item.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectProduct(item)}
            className="bg-white/10 backdrop-blur-xl rounded-xl md:rounded-2xl p-4 md:p-6 text-left hover:bg-white/20 transition-all border border-white/10 touch-manipulation"
          >
            {item.image ? (
              <img
                src={item.image}
                alt={item.name}
                className="w-full aspect-square object-cover rounded-lg mb-3 md:mb-4"
              />
            ) : (
              <div className="w-full aspect-square bg-white/10 rounded-lg mb-3 md:mb-4 flex items-center justify-center text-4xl md:text-6xl">
                👗
              </div>
            )}
            <h3 className="font-semibold text-sm md:text-lg mb-1 line-clamp-2">{item.name}</h3>
            <p className="opacity-70 text-sm md:text-base">₹{item.price.toLocaleString()}</p>
            {item.matchScore && (
              <div className="mt-2 md:mt-3 flex items-center gap-2">
                <div
                  className={`text-xs px-2 py-1 rounded-full ${
                    item.matchScore >= 90
                      ? 'bg-success/20 text-success'
                      : item.matchScore >= 80
                      ? 'bg-secondary/20 text-secondary'
                      : 'bg-white/20'
                  }`}
                >
                  {item.matchScore}% {t.match}
                </div>
              </div>
            )}
          </motion.button>
        ))}
      </div>

      <div className="flex justify-center">
        <Button variant="glass" size="xl" onClick={onViewWishlist} className="touch-manipulation">
          <IconHeart className="w-5 h-5" />
          {t.wishlist} ({wishlistCount})
        </Button>
      </div>
    </motion.div>
  );
}
