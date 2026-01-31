import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IconCamera, 
  IconSparkles, 
  IconPlayerPlay,
  IconRefresh,
  IconLink,
  IconPhoto,
  IconMicrophone,
  IconX,
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useStore } from '@/hooks/useDatabase';
import { useProductsWithDetails } from '@/hooks/useProducts';
import { LiveCameraTryOn } from '@/components/tryon/LiveCameraTryOn';
import { EcomTryOn } from '@/components/tryon/EcomTryOn';
import { SavedTryOnGallery } from '@/components/tryon/SavedTryOnGallery';
import { VoiceChat } from '@/components/tryon/VoiceChat';

export default function TryOnPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: store } = useStore(user?.id);
  const { data: products } = useProductsWithDetails(store?.id);

  const [activeTab, setActiveTab] = useState('live-camera');
  const [language, setLanguage] = useState<'english' | 'hindi' | 'hinglish'>('hinglish');
  const [showVoiceChat, setShowVoiceChat] = useState(false);

  // Filter products for try-on (costumes and jewellery)
  const tryOnProducts = (products || []).filter((p: any) => {
    const categoryName = p.category?.name?.toLowerCase() || '';
    return (
      p.enable_tryon ||
      categoryName.includes('saree') ||
      categoryName.includes('lehenga') ||
      categoryName.includes('kurti') ||
      categoryName.includes('dress') ||
      categoryName.includes('jewel') ||
      categoryName.includes('suit')
    );
  });

  const displayProducts = tryOnProducts.length > 0 ? tryOnProducts : sampleProducts;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            Virtual Try-On Studio
          </h1>
          <p className="text-muted-foreground mt-1">
            AI-powered virtual try-on for inventory & e-commerce products
          </p>
        </div>
        <div className="flex gap-3">
          {/* Language Selector */}
          <div className="flex rounded-lg border border-border overflow-hidden">
            {(['english', 'hindi', 'hinglish'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-3 py-2 text-sm capitalize transition-colors ${
                  language === lang
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background hover:bg-muted'
                }`}
              >
                {lang === 'hinglish' ? 'Hinglish' : lang === 'hindi' ? 'हिंदी' : 'English'}
              </button>
            ))}
          </div>
          <Button
            variant={showVoiceChat ? 'destructive' : 'outline'}
            size="sm"
            onClick={() => setShowVoiceChat(!showVoiceChat)}
            className="gap-2"
          >
            {showVoiceChat ? (
              <>
                <IconX className="w-4 h-4" />
                Close Chat
              </>
            ) : (
              <>
                <IconMicrophone className="w-4 h-4" />
                Voice AI
              </>
            )}
          </Button>
          <Button variant="gold" onClick={() => navigate('/kiosk')}>
            <IconPlayerPlay className="w-4 h-4" />
            Launch Kiosk
          </Button>
        </div>
      </div>

      {/* Voice Chat Panel */}
      <AnimatePresence>
        {showVoiceChat && (
          <VoiceChat
            language={language}
            onClose={() => setShowVoiceChat(false)}
          />
        )}
      </AnimatePresence>

      {/* Mode Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="live-camera" className="flex items-center gap-2">
            <IconCamera className="w-4 h-4" />
            <span className="hidden sm:inline">Live Camera</span>
            <span className="sm:hidden">Camera</span>
          </TabsTrigger>
          <TabsTrigger value="ecom-tryon" className="flex items-center gap-2">
            <IconLink className="w-4 h-4" />
            <span className="hidden sm:inline">eCom Try-On</span>
            <span className="sm:hidden">eCom</span>
          </TabsTrigger>
          <TabsTrigger value="saved" className="flex items-center gap-2">
            <IconPhoto className="w-4 h-4" />
            <span className="hidden sm:inline">Saved Looks</span>
            <span className="sm:hidden">Saved</span>
          </TabsTrigger>
        </TabsList>

        {/* Live Camera Mode - Inventory Matching */}
        <TabsContent value="live-camera" className="mt-6">
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-4 border border-primary/20">
              <div className="flex items-start gap-3">
                <IconSparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">How it works</p>
                  <p className="text-sm text-muted-foreground">
                    Upload 3-5 photos of yourself from different angles → AI analyzes your features → 
                    See matching outfits from store inventory → Save your favorite looks
                  </p>
                </div>
              </div>
            </div>
            <LiveCameraTryOn
              storeId={store?.id}
              products={displayProducts}
              language={language}
            />
          </div>
        </TabsContent>

        {/* eCom Try-On Mode */}
        <TabsContent value="ecom-tryon" className="mt-6">
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-4 border border-primary/20">
              <div className="flex items-start gap-3">
                <IconSparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">How it works</p>
                  <p className="text-sm text-muted-foreground">
                    Step 1: Paste any e-commerce product URL → We fetch product images automatically → 
                    Step 2: Upload your photos → See virtual try-on result → Save with your details
                  </p>
                </div>
              </div>
            </div>
            <EcomTryOn
              storeId={store?.id}
              language={language}
            />
          </div>
        </TabsContent>

        {/* Saved Results */}
        <TabsContent value="saved" className="mt-6">
          <SavedTryOnGallery storeId={store?.id} />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

const sampleProducts = [
  { id: '1', name: 'Silk Saree - Royal Blue', base_price: 4599, category: { name: 'Sarees' }, images: [], variants: [{ color: 'blue' }] },
  { id: '2', name: 'Designer Lehenga Set', base_price: 12999, category: { name: 'Lehengas' }, images: [], variants: [{ color: 'red' }, { color: 'gold' }] },
  { id: '3', name: 'Embroidered Kurti', base_price: 1299, category: { name: 'Kurtis' }, images: [], variants: [{ color: 'green' }] },
  { id: '4', name: 'Gold Necklace - Temple', base_price: 24999, category: { name: 'Jewellery' }, images: [], variants: [] },
  { id: '5', name: 'Maroon Anarkali Suit', base_price: 3499, category: { name: 'Suits' }, images: [], variants: [{ color: 'maroon' }] },
];
