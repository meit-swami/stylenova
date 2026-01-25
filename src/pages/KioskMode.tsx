import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { IconSparkles, IconHeart, IconX, IconLoader2 } from '@tabler/icons-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useStore } from '@/hooks/useDatabase';
import { useProductsWithDetails } from '@/hooks/useProducts';
import { KioskWelcome } from '@/components/kiosk/KioskWelcome';
import { KioskCamera } from '@/components/kiosk/KioskCamera';
import { KioskSuggestions } from '@/components/kiosk/KioskSuggestions';
import { KioskTryOn } from '@/components/kiosk/KioskTryOn';
import { KioskWishlist } from '@/components/kiosk/KioskWishlist';

const aiComments = {
  english: "Wow! Based on your warm skin tone and elegant style, I've picked some beautiful pieces that would complement you perfectly! 🌟",
  hindi: "वाह! आपकी गर्म त्वचा टोन और एलिगेंट स्टाइल के आधार पर, मैंने कुछ खूबसूरत पीस चुने हैं जो आप पर शानदार लगेंगे! 🌟",
  hinglish: "Wow! Aapki warm skin tone aur elegant style ke basis par, maine kuch beautiful pieces choose kiye hain jo aap par perfect lagenge! 🌟",
};

type Step = 'welcome' | 'capture' | 'suggestions' | 'tryon' | 'wishlist';

interface KioskProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  matchScore?: number;
}

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image: string;
}

export default function KioskMode() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: store, isLoading: storeLoading } = useStore(user?.id);
  const { data: rawProducts, isLoading: productsLoading } = useProductsWithDetails(store?.id);

  const [step, setStep] = useState<Step>('welcome');
  const [language, setLanguage] = useState<'english' | 'hindi' | 'hinglish'>('hinglish');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<KioskProduct | null>(null);
  const [selectedProductIndex, setSelectedProductIndex] = useState(0);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [lightMode, setLightMode] = useState(false);

  // Transform database products to kiosk format with random match scores
  const products: KioskProduct[] = useMemo(() => {
    if (!rawProducts) return [];
    
    return rawProducts
      .filter(p => p.is_active && p.enable_tryon)
      .map(product => ({
        id: product.id,
        name: product.name,
        price: product.sale_price || product.base_price,
        image: product.images?.[0] || '',
        matchScore: Math.floor(Math.random() * 25) + 75, // Random 75-100% match score for demo
      }))
      .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
      .slice(0, 12); // Show top 12 products
  }, [rawProducts]);

  const handleCapture = useCallback((imageData: string) => {
    setCapturedImage(imageData);
    setStep('suggestions');
    toast.success(
      language === 'english' ? 'Photo captured! Analyzing...' :
      language === 'hindi' ? 'फोटो कैप्चर हुई! विश्लेषण हो रहा है...' :
      'Photo capture ho gayi! Analyzing...'
    );
  }, [language]);

  const handleSelectProduct = useCallback((product: KioskProduct) => {
    setSelectedProduct(product);
    setSelectedProductIndex(products.findIndex(p => p.id === product.id));
    setStep('tryon');
  }, [products]);

  const handleNextProduct = useCallback(() => {
    if (products.length === 0) return;
    const nextIndex = (selectedProductIndex + 1) % products.length;
    setSelectedProductIndex(nextIndex);
    setSelectedProduct(products[nextIndex]);
  }, [selectedProductIndex, products]);

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

  const isLoading = storeLoading || productsLoading;

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <IconLoader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg opacity-70">Loading your store products...</p>
        </div>
      </div>
    );
  }

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
            <h1 className="font-display text-xl md:text-2xl font-bold">
              {store?.brand_name || store?.name || 'StyleNova'} ✨
            </h1>
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
          <button
            onClick={() => navigate('/dashboard/try-on')}
            className="p-2.5 md:p-3 rounded-xl bg-white/10 backdrop-blur-md hover:bg-white/20 transition-colors touch-manipulation"
          >
            <IconX className="w-5 h-5 md:w-6 md:h-6" />
          </button>
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
              products={products.length > 0 ? products : [
                { id: 'demo-1', name: 'No products available', price: 0, image: '', matchScore: 0 }
              ]}
              aiComment={products.length > 0 
                ? aiComments[language] 
                : language === 'english' 
                  ? 'Add products to your inventory to see AI recommendations here!'
                  : language === 'hindi'
                    ? 'AI सुझाव देखने के लिए अपनी इन्वेंट्री में प्रोडक्ट्स जोड़ें!'
                    : 'AI recommendations dekhne ke liye apni inventory mein products add karo!'
              }
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
        Powered by {store?.brand_name || 'StyleNova'} ✨ • Developed by Brandzaha Creative Agency with ❤️
      </footer>
    </div>
  );
}
