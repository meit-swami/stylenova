import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconSparkles, IconHeart, IconX } from '@tabler/icons-react';
import { toast } from 'sonner';
import { KioskWelcome } from '@/components/kiosk/KioskWelcome';
import { KioskCamera } from '@/components/kiosk/KioskCamera';
import { KioskSuggestions } from '@/components/kiosk/KioskSuggestions';
import { KioskTryOn } from '@/components/kiosk/KioskTryOn';
import { KioskWishlist } from '@/components/kiosk/KioskWishlist';

// Sample products for demo
const sampleProducts = [
  { id: '1', name: 'Silk Saree - Royal Blue', price: 4599, image: '', matchScore: 95 },
  { id: '2', name: 'Designer Lehenga', price: 12999, image: '', matchScore: 88 },
  { id: '3', name: 'Embroidered Kurti', price: 1299, image: '', matchScore: 82 },
  { id: '4', name: 'Gold Temple Necklace', price: 24999, image: '', matchScore: 78 },
  { id: '5', name: 'Silk Dupatta', price: 899, image: '', matchScore: 75 },
  { id: '6', name: 'Traditional Bangles Set', price: 499, image: '', matchScore: 72 },
];

const aiComments = {
  english: "Wow! Based on your warm skin tone and elegant style, I've picked some beautiful pieces. The royal blue saree would look stunning on you! 🌟",
  hindi: "वाह! आपकी गर्म त्वचा टोन और एलिगेंट स्टाइल के आधार पर, मैंने कुछ खूबसूरत पीस चुने हैं। रॉयल ब्लू साड़ी आप पर बहुत सुंदर लगेगी! 🌟",
  hinglish: "Wow! Aapki warm skin tone aur elegant style ke basis par, maine kuch beautiful pieces choose kiye hain. Royal blue saree aap par stunning lagegi! 🌟",
};

type Step = 'welcome' | 'capture' | 'suggestions' | 'tryon' | 'wishlist';

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image: string;
}

export default function KioskMode() {
  const [step, setStep] = useState<Step>('welcome');
  const [language, setLanguage] = useState<'english' | 'hindi' | 'hinglish'>('hinglish');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<typeof sampleProducts[0] | null>(null);
  const [selectedProductIndex, setSelectedProductIndex] = useState(0);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [lightMode, setLightMode] = useState(false);

  const handleCapture = useCallback((imageData: string) => {
    setCapturedImage(imageData);
    setStep('suggestions');
    toast.success(
      language === 'english' ? 'Photo captured! Analyzing...' :
      language === 'hindi' ? 'फोटो कैप्चर हुई! विश्लेषण हो रहा है...' :
      'Photo capture ho gayi! Analyzing...'
    );
  }, [language]);

  const handleSelectProduct = useCallback((product: typeof sampleProducts[0]) => {
    setSelectedProduct(product);
    setSelectedProductIndex(sampleProducts.findIndex(p => p.id === product.id));
    setStep('tryon');
  }, []);

  const handleNextProduct = useCallback(() => {
    const nextIndex = (selectedProductIndex + 1) % sampleProducts.length;
    setSelectedProductIndex(nextIndex);
    setSelectedProduct(sampleProducts[nextIndex]);
  }, [selectedProductIndex]);

  const handleAddToWishlist = useCallback(() => {
    if (!selectedProduct) return;
    
    if (wishlist.some(item => item.id === selectedProduct.id)) {
      toast.info(
        language === 'english' ? 'Already in wishlist!' :
        language === 'hindi' ? 'पहले से विशलिस्ट में है!' :
        'Already wishlist mein hai!'
      );
      return;
    }

    setWishlist(prev => [...prev, {
      id: selectedProduct.id,
      name: selectedProduct.name,
      price: selectedProduct.price,
      image: selectedProduct.image,
    }]);
    
    toast.success(
      language === 'english' ? 'Added to wishlist! ❤️' :
      language === 'hindi' ? 'विशलिस्ट में जोड़ा गया! ❤️' :
      'Wishlist mein add ho gaya! ❤️'
    );
  }, [selectedProduct, wishlist, language]);

  const handleRemoveFromWishlist = useCallback((id: string) => {
    setWishlist(prev => prev.filter(item => item.id !== id));
    toast.success('Removed from wishlist');
  }, []);

  const handleShare = useCallback(() => {
    toast.success(
      language === 'english' ? 'Share link copied!' :
      language === 'hindi' ? 'शेयर लिंक कॉपी हो गया!' :
      'Share link copy ho gaya!'
    );
  }, [language]);

  const handleGenerateQR = useCallback(() => {
    toast.success(
      language === 'english' ? 'QR Code generated! Check your phone.' :
      language === 'hindi' ? 'QR कोड बन गया! अपना फोन चेक करें।' :
      'QR Code ban gaya! Apna phone check karo.'
    );
  }, [language]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 grid-pattern opacity-10" />

      {/* Floating Elements */}
      <motion.div
        className="absolute top-20 left-10 w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 blur-3xl"
        animate={{ y: [0, -30, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-40 h-40 rounded-full bg-gradient-to-br from-secondary/20 to-amber-400/20 blur-3xl"
        animate={{ y: [0, 30, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 10, repeat: Infinity, delay: 1 }}
      />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-4 md:p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <IconSparkles className="w-5 h-5 md:w-7 md:h-7" />
          </div>
          <div>
            <h1 className="font-display text-xl md:text-2xl font-bold">StyleNova ✨</h1>
            <p className="text-xs md:text-sm opacity-60">Virtual Try-On Experience</p>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          {/* Wishlist Badge */}
          <button 
            onClick={() => setStep('wishlist')}
            className="relative p-2.5 md:p-3 rounded-xl bg-white/10 backdrop-blur-md hover:bg-white/20 transition-colors touch-manipulation"
          >
            <IconHeart className="w-5 h-5 md:w-6 md:h-6" />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-xs flex items-center justify-center font-medium">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Exit Button */}
          <a
            href="/dashboard"
            className="p-2.5 md:p-3 rounded-xl bg-white/10 backdrop-blur-md hover:bg-white/20 transition-colors touch-manipulation"
          >
            <IconX className="w-5 h-5 md:w-6 md:h-6" />
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-4 md:px-6 pb-20 md:pb-6">
        <AnimatePresence mode="wait">
          {step === 'welcome' && (
            <KioskWelcome
              onStart={() => setStep('capture')}
              language={language}
              onLanguageChange={setLanguage}
            />
          )}

          {step === 'capture' && (
            <KioskCamera
              onBack={() => setStep('welcome')}
              onCapture={handleCapture}
              language={language}
            />
          )}

          {step === 'suggestions' && (
            <KioskSuggestions
              products={sampleProducts}
              aiComment={aiComments[language]}
              onRescan={() => setStep('capture')}
              onSelectProduct={handleSelectProduct}
              onViewWishlist={() => setStep('wishlist')}
              wishlistCount={wishlist.length}
              language={language}
            />
          )}

          {step === 'tryon' && selectedProduct && (
            <KioskTryOn
              product={selectedProduct}
              customerImage={capturedImage}
              onBack={() => setStep('suggestions')}
              onNext={handleNextProduct}
              onAddToWishlist={handleAddToWishlist}
              onShare={handleShare}
              lightMode={lightMode}
              onToggleLight={() => setLightMode(!lightMode)}
              language={language}
            />
          )}

          {step === 'wishlist' && (
            <KioskWishlist
              items={wishlist}
              onRemoveItem={handleRemoveFromWishlist}
              onBack={() => setStep('suggestions')}
              onGenerateQR={handleGenerateQR}
              language={language}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 p-4 text-center text-xs md:text-sm opacity-50">
        Powered by StyleNova ✨ • Developed by Brandzaha Creative Agency with ❤️
      </footer>
    </div>
  );
}
