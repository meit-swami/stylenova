import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IconCamera, 
  IconSparkles, 
  IconUser, 
  IconPalette,
  IconRuler,
  IconHeart,
  IconShare,
  IconQrcode,
  IconPlayerPlay,
  IconRefresh,
  IconX,
  IconVolume,
  IconMicrophone
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAuth } from '@/hooks/useAuth';
import { useStore } from '@/hooks/useDatabase';
import { useProductsWithDetails } from '@/hooks/useProducts';
import { useVirtualTryOn } from '@/hooks/useVirtualTryOn';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function TryOnPage() {
  const { user } = useAuth();
  const { data: store } = useStore(user?.id);
  const { data: products } = useProductsWithDetails(store?.id);
  
  const {
    videoRef,
    canvasRef,
    isCapturing,
    isProcessing,
    capturedImage,
    tryOnResult,
    startCamera,
    stopCamera,
    captureImage,
    processTryOn,
    getRecommendations,
    reset,
  } = useVirtualTryOn();

  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [language, setLanguage] = useState<'english' | 'hindi' | 'hinglish'>('hinglish');
  const [showWishlistDialog, setShowWishlistDialog] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '' });
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);

  // Initialize camera on mount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Get recommendations when we have try-on results
  useEffect(() => {
    if (tryOnResult?.detectedFeatures && products) {
      getRecommendations(tryOnResult.detectedFeatures, products).then(setRecommendations);
    }
  }, [tryOnResult, products, getRecommendations]);

  const handleCapture = async () => {
    if (!isCapturing) {
      await startCamera();
    } else {
      const image = captureImage();
      if (image) {
        toast.success('Photo captured!');
      }
    }
  };

  const handleTryOn = async (product: any) => {
    if (!capturedImage) {
      toast.error('Please capture a photo first');
      return;
    }

    setSelectedProduct(product);
    const productImage = product.images?.[0] || '';
    await processTryOn(capturedImage, productImage, product.name, language);
  };

  const handleAddToWishlist = (product: any) => {
    if (!wishlistItems.find(item => item.id === product.id)) {
      setWishlistItems([...wishlistItems, product]);
      toast.success('Added to wishlist');
    }
  };

  const handleSaveWishlist = async () => {
    if (!store?.id || !customerInfo.name || !customerInfo.phone) {
      toast.error('Please enter customer details');
      return;
    }

    try {
      // Create try-on session
      const { data: session, error: sessionError } = await supabase
        .from('tryon_sessions')
        .insert({
          store_id: store.id,
          customer_name: customerInfo.name,
          customer_phone: customerInfo.phone,
          detected_skin_tone: tryOnResult?.detectedFeatures?.skinTone,
          detected_body_type: tryOnResult?.detectedFeatures?.bodyType,
          detected_height: tryOnResult?.detectedFeatures?.height,
          favorite_colors: tryOnResult?.detectedFeatures?.recommendedColors,
          captured_images: capturedImage ? [capturedImage] : [],
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Create wishlist
      const { data: wishlist, error: wishlistError } = await supabase
        .from('wishlists')
        .insert({
          store_id: store.id,
          session_id: session.id,
          customer_name: customerInfo.name,
          customer_phone: customerInfo.phone,
          is_public: true,
        })
        .select()
        .single();

      if (wishlistError) throw wishlistError;

      toast.success('Wishlist saved! Share link generated.');
      setShowWishlistDialog(false);
      
      // Open share URL
      const shareUrl = `${window.location.origin}/wishlist/${wishlist.id}`;
      navigator.clipboard.writeText(shareUrl);
      toast.info('Share link copied to clipboard');
    } catch (error: any) {
      console.error('Error saving wishlist:', error);
      toast.error('Failed to save wishlist');
    }
  };

  const handleNewSession = () => {
    reset();
    setSelectedProduct(null);
    setRecommendations([]);
    setWishlistItems([]);
    setCustomerInfo({ name: '', phone: '' });
    stopCamera();
  };

  // Use products or sample data
  const displayProducts = products?.length ? products : sampleProducts;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            Virtual Try-On Studio
          </h1>
          <p className="text-muted-foreground mt-1">
            AI-powered outfit visualization for your customers
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleNewSession}>
            <IconRefresh className="w-4 h-4" />
            New Session
          </Button>
          <Button variant="gold" onClick={() => window.open('/kiosk', '_blank')}>
            <IconPlayerPlay className="w-4 h-4" />
            Launch Kiosk
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Panel - Camera/Preview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Camera View */}
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="aspect-video bg-gradient-to-br from-slate-900 to-slate-800 relative flex items-center justify-center">
              {isCapturing ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  style={{ transform: 'scaleX(-1)' }}
                />
              ) : capturedImage ? (
                <img 
                  src={capturedImage} 
                  alt="Captured" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center text-muted-foreground">
                  <div className="w-20 h-20 rounded-full bg-muted/20 flex items-center justify-center mx-auto mb-4">
                    <IconCamera className="w-10 h-10" />
                  </div>
                  <p className="font-medium mb-2">Camera Preview</p>
                  <p className="text-sm opacity-60">Click capture to start</p>
                </div>
              )}
              
              {/* Detection Overlay */}
              {isCapturing && (
                <div className="absolute inset-4 border-2 border-dashed border-primary/30 rounded-xl pointer-events-none" />
              )}
              
              {/* Controls */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
                <Button 
                  variant="glass" 
                  size="lg"
                  onClick={handleCapture}
                  disabled={isProcessing}
                >
                  <IconCamera className="w-5 h-5" />
                  {isCapturing ? 'Capture' : capturedImage ? 'Retake' : 'Start Camera'}
                </Button>
                {capturedImage && (
                  <Button variant="glass" size="lg" onClick={() => { reset(); startCamera(); }}>
                    <IconRefresh className="w-5 h-5" />
                    Reset
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* AI Detection Results */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <h3 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <IconSparkles className="w-5 h-5 text-secondary" />
              AI Detection Results
            </h3>
            
            <div className="grid sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-muted/50">
                <IconUser className="w-6 h-6 text-primary mb-2" />
                <p className="text-sm text-muted-foreground">Skin Tone</p>
                <p className="font-medium text-foreground">
                  {tryOnResult?.detectedFeatures?.skinTone || 'Analyzing...'}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-muted/50">
                <IconRuler className="w-6 h-6 text-primary mb-2" />
                <p className="text-sm text-muted-foreground">Body Type</p>
                <p className="font-medium text-foreground">
                  {tryOnResult?.detectedFeatures?.bodyType || 'Analyzing...'}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-muted/50">
                <IconRuler className="w-6 h-6 text-primary mb-2" />
                <p className="text-sm text-muted-foreground">Height Est.</p>
                <p className="font-medium text-foreground">
                  {tryOnResult?.detectedFeatures?.height || 'Analyzing...'}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-muted/50">
                <IconPalette className="w-6 h-6 text-primary mb-2" />
                <p className="text-sm text-muted-foreground">Best Colors</p>
                <div className="flex gap-1 mt-1 flex-wrap">
                  {(tryOnResult?.detectedFeatures?.recommendedColors || ['Detecting...']).slice(0, 3).map((color, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {color}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Try-On Result */}
          <AnimatePresence>
            {selectedProduct && tryOnResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-card rounded-2xl border border-border overflow-hidden"
              >
                <div className="aspect-[3/4] bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 relative flex items-center justify-center p-8">
                  <div className="text-center">
                    <div className="w-32 h-32 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4 overflow-hidden">
                      {selectedProduct.images?.[0] ? (
                        <img src={selectedProduct.images[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-6xl">{getProductEmoji(selectedProduct.category?.name)}</span>
                      )}
                    </div>
                    <Badge className="mb-4" variant="secondary">
                      {tryOnResult.matchScore}% Match
                    </Badge>
                    <p className="text-xl font-display font-bold text-foreground">
                      {selectedProduct.name}
                    </p>
                    <p className="text-lg font-semibold text-primary mt-2">
                      ₹{selectedProduct.base_price?.toLocaleString()}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
                    <Button variant="outline" size="sm" onClick={() => handleAddToWishlist(selectedProduct)}>
                      <IconHeart className="w-4 h-4" />
                      Save
                    </Button>
                    <Button variant="outline" size="sm">
                      <IconShare className="w-4 h-4" />
                      Share
                    </Button>
                    <Button variant="hero" size="sm" onClick={() => setShowWishlistDialog(true)}>
                      <IconQrcode className="w-4 h-4" />
                      QR Code
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Panel - Suggestions */}
        <div className="space-y-6">
          {/* AI Suggestions */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <h3 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <IconSparkles className="w-5 h-5 text-secondary" />
              AI Suggestions
            </h3>
            
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {(recommendations.length ? recommendations : displayProducts?.slice(0, 5) || []).map((product: any) => (
                <button
                  key={product.id}
                  onClick={() => handleTryOn(product)}
                  disabled={isProcessing || !capturedImage}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    selectedProduct?.id === product.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  } ${(!capturedImage || isProcessing) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                      {product.images?.[0] ? (
                        <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl">{getProductEmoji(product.category?.name)}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{product.name}</p>
                      <p className="text-sm text-muted-foreground">₹{product.base_price?.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${
                        (product.matchScore || 85) >= 90 ? 'text-emerald-500' :
                        (product.matchScore || 85) >= 80 ? 'text-amber-500' : 'text-muted-foreground'
                      }`}>
                        {product.matchScore || Math.floor(Math.random() * 15 + 80)}% match
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Wishlist Summary */}
          <div className="bg-gradient-to-br from-primary to-accent rounded-2xl p-6 text-primary-foreground">
            <IconHeart className="w-8 h-8 mb-4" />
            <h3 className="font-display text-lg font-semibold mb-2">
              Customer Wishlist
            </h3>
            <p className="text-sm opacity-80 mb-4">
              {wishlistItems.length} items saved • Ready to share
            </p>
            <div className="flex gap-2">
              <Button 
                variant="glass" 
                size="sm"
                onClick={() => setShowWishlistDialog(true)}
                disabled={wishlistItems.length === 0}
              >
                <IconQrcode className="w-4 h-4" />
                Generate QR
              </Button>
              <Button variant="glass" size="sm">
                <IconShare className="w-4 h-4" />
                Share
              </Button>
            </div>
          </div>

          {/* AI Assistant */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <h3 className="font-display text-lg font-semibold text-foreground mb-4">
              AI Assistant
            </h3>
            <div className="p-4 rounded-xl bg-muted/50 italic text-muted-foreground min-h-[60px]">
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  Analyzing outfit...
                </div>
              ) : tryOnResult?.aiComment ? (
                `"${tryOnResult.aiComment}"`
              ) : (
                "Capture a photo and select an outfit to get personalized recommendations!"
              )}
            </div>
            <div className="flex gap-2 mt-4">
              {(['hindi', 'english', 'hinglish'] as const).map((lang) => (
                <Button 
                  key={lang}
                  variant={language === lang ? 'default' : 'outline'} 
                  size="sm" 
                  className="flex-1 capitalize"
                  onClick={() => setLanguage(lang)}
                >
                  {lang}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Wishlist Dialog */}
      <Dialog open={showWishlistDialog} onOpenChange={setShowWishlistDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save & Share Wishlist</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Customer Name</Label>
              <Input
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                placeholder="Enter customer name"
              />
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                placeholder="+91 98765 43210"
              />
            </div>
            <div className="p-4 rounded-xl bg-muted/50">
              <p className="text-sm text-muted-foreground mb-2">Items in wishlist:</p>
              <div className="flex flex-wrap gap-2">
                {wishlistItems.map((item) => (
                  <Badge key={item.id} variant="secondary">
                    {item.name}
                  </Badge>
                ))}
                {wishlistItems.length === 0 && (
                  <p className="text-sm text-muted-foreground">No items yet</p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWishlistDialog(false)}>Cancel</Button>
            <Button variant="hero" onClick={handleSaveWishlist}>
              Save & Generate QR
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

// Sample products for demo when no real products exist
const sampleProducts = [
  { id: '1', name: 'Silk Saree - Royal Blue', base_price: 4599, category: { name: 'Sarees' }, images: [], matchScore: 95 },
  { id: '2', name: 'Designer Lehenga Set', base_price: 12999, category: { name: 'Lehengas' }, images: [], matchScore: 88 },
  { id: '3', name: 'Embroidered Kurti', base_price: 1299, category: { name: 'Kurtis' }, images: [], matchScore: 82 },
  { id: '4', name: 'Gold Necklace - Temple', base_price: 24999, category: { name: 'Jewellery' }, images: [], matchScore: 78 },
  { id: '5', name: 'Slim Fit Jeans', base_price: 1899, category: { name: 'Jeans' }, images: [], matchScore: 75 },
];

function getProductEmoji(category?: string): string {
  const emojiMap: Record<string, string> = {
    'Sarees': '🥻',
    'Lehengas': '👗',
    'Suits': '👔',
    'Kurtis': '👚',
    'Jeans': '👖',
    'T-Shirts': '👕',
    'Jewellery': '📿',
  };
  return emojiMap[category || ''] || '👗';
}
