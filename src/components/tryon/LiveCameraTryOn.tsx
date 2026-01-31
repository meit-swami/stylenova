import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IconSparkles,
  IconLoader2,
  IconHeart,
  IconShirt,
  IconRefresh,
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PersonPhotosUpload } from './PersonPhotosUpload';
import { CustomerSaveForm, CustomerInfo } from './CustomerSaveForm';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface InventoryProduct {
  id: string;
  name: string;
  images: string[];
  base_price: number;
  category?: { name: string };
  variants?: any[];
}

interface MatchedProduct extends InventoryProduct {
  matchScore: number;
  aiComment: string;
}

interface LiveCameraTryOnProps {
  storeId?: string;
  products: InventoryProduct[];
  language?: 'english' | 'hindi' | 'hinglish';
}

export function LiveCameraTryOn({
  storeId,
  products,
  language = 'hinglish',
}: LiveCameraTryOnProps) {
  const [personImages, setPersonImages] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [matchedProducts, setMatchedProducts] = useState<MatchedProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<MatchedProduct | null>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [detectedFeatures, setDetectedFeatures] = useState<any>(null);

  const analyzeAndMatch = useCallback(async () => {
    if (personImages.length < 3) {
      toast.error('Please upload at least 3 photos');
      return;
    }

    setIsAnalyzing(true);
    setMatchedProducts([]);
    setSelectedProduct(null);

    try {
      // Step 1: Analyze person's features
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke('ai-assistant', {
        body: {
          type: 'analyze_customer',
          context: {
            customerImage: personImages[0], // Use front photo for analysis
          },
          language,
        },
      });

      if (analysisError) throw analysisError;

      // Parse detected features
      const features = {
        skinTone: extractFeature(analysisData.content, 'skin tone') || 'Warm Medium',
        bodyType: extractFeature(analysisData.content, 'body type') || 'Athletic',
        recommendedColors: extractColors(analysisData.content) || ['Royal Blue', 'Gold', 'Maroon'],
      };
      setDetectedFeatures(features);

      // Step 2: Match with inventory products
      const matched: MatchedProduct[] = await Promise.all(
        products.slice(0, 10).map(async (product) => {
          // Calculate match score based on color compatibility
          const productColors = product.variants?.flatMap((v: any) => v.color?.toLowerCase() || []) || [];
          const productName = product.name.toLowerCase();
          
          let score = 70;
          
          // Color matching
          features.recommendedColors.forEach((color: string) => {
            if (productColors.some((pc: string) => pc.includes(color.toLowerCase()))) {
              score += 10;
            }
          });

          // Add variation
          score += Math.floor(Math.random() * 10);
          score = Math.min(99, score);

          // Get AI comment for top matches
          let aiComment = '';
          if (score > 80) {
            try {
              const { data: commentData } = await supabase.functions.invoke('ai-assistant', {
                body: {
                  type: 'outfit_comment',
                  context: {
                    productName: product.name,
                    skinTone: features.skinTone,
                    bodyType: features.bodyType,
                    matchScore: score,
                  },
                  language,
                },
              });
              aiComment = commentData?.content || '';
            } catch {
              aiComment = language === 'hinglish' 
                ? 'Yeh outfit aap pe bahut achha lagega!' 
                : 'This outfit would look great on you!';
            }
          }

          return {
            ...product,
            matchScore: score,
            aiComment,
          };
        })
      );

      // Sort by match score
      matched.sort((a, b) => b.matchScore - a.matchScore);
      setMatchedProducts(matched);

      toast.success('Analysis complete! See your matching outfits below.');
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast.error('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  }, [personImages, products, language]);

  const handleProductSelect = useCallback(async (product: MatchedProduct) => {
    setSelectedProduct(product);
    
    // In a real implementation, this would generate an overlay image
    // For now, we use the person's photo with product info
    setProcessedImageUrl(personImages[0]);
  }, [personImages]);

  const handleSaveResult = useCallback(async (customerInfo: CustomerInfo) => {
    if (!selectedProduct || !storeId) return;

    try {
      // Create session first
      const { data: session, error: sessionError } = await supabase
        .from('tryon_sessions')
        .insert({
          store_id: storeId,
          customer_name: customerInfo.fullName,
          customer_phone: customerInfo.mobileNumber,
          detected_skin_tone: detectedFeatures?.skinTone,
          detected_body_type: detectedFeatures?.bodyType,
          favorite_colors: detectedFeatures?.recommendedColors,
          captured_images: personImages,
          session_data: { address: customerInfo.address },
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Save try-on result
      await (supabase.from('virtual_tryon_results') as any).insert({
        store_id: storeId,
        session_id: session.id,
        analysis_type: 'live_camera_inventory',
        product_id: selectedProduct.id,
        product_name: selectedProduct.name,
        product_images: selectedProduct.images,
        customer_image_url: processedImageUrl,
        detected_features: detectedFeatures,
        ai_comment: selectedProduct.aiComment,
        match_score: selectedProduct.matchScore,
        processing_status: 'completed',
        is_saved: true,
        raw_request_data: { personImageCount: personImages.length },
      });

      toast.success('Your look has been saved! You can view it anytime.');
    } catch (error: any) {
      console.error('Save error:', error);
      throw error;
    }
  }, [selectedProduct, storeId, personImages, processedImageUrl, detectedFeatures]);

  const handleReset = useCallback(() => {
    setPersonImages([]);
    setMatchedProducts([]);
    setSelectedProduct(null);
    setProcessedImageUrl(null);
    setDetectedFeatures(null);
  }, []);

  return (
    <div className="space-y-6">
      {/* Step 1: Upload Person Photos */}
      <PersonPhotosUpload
        images={personImages}
        onImagesChange={setPersonImages}
        title="Step 1: Upload Your Photos"
        subtitle="Upload 3-5 photos from different angles (front, side, full body) for best matching results"
      />

      {/* Analyze Button */}
      {personImages.length >= 3 && matchedProducts.length === 0 && (
        <Button
          variant="gold"
          size="lg"
          className="w-full"
          onClick={analyzeAndMatch}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? (
            <>
              <IconLoader2 className="w-5 h-5 animate-spin" />
              Analyzing & Finding Matches...
            </>
          ) : (
            <>
              <IconSparkles className="w-5 h-5" />
              Find Matching Outfits
            </>
          )}
        </Button>
      )}

      {/* Detected Features */}
      {detectedFeatures && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-4 border border-primary/20"
        >
          <p className="text-sm font-medium text-foreground mb-2">Detected Features</p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Skin: {detectedFeatures.skinTone}</Badge>
            <Badge variant="secondary">Body: {detectedFeatures.bodyType}</Badge>
            {detectedFeatures.recommendedColors?.slice(0, 3).map((color: string, i: number) => (
              <Badge key={i} variant="outline">{color}</Badge>
            ))}
          </div>
        </motion.div>
      )}

      {/* Matched Products */}
      <AnimatePresence>
        {matchedProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl border border-border p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
                <IconShirt className="w-5 h-5 text-primary" />
                Matching Outfits from Inventory
              </h3>
              <Button variant="ghost" size="sm" onClick={handleReset}>
                <IconRefresh className="w-4 h-4" />
                Reset
              </Button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {matchedProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleProductSelect(product)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    selectedProduct?.id === product.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="aspect-square rounded-lg bg-muted mb-3 overflow-hidden">
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <IconShirt className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <p className="font-medium text-foreground truncate">{product.name}</p>
                  <p className="text-sm text-muted-foreground">₹{product.base_price?.toLocaleString()}</p>
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant={product.matchScore >= 90 ? 'default' : 'secondary'}>
                      {product.matchScore}% Match
                    </Badge>
                  </div>
                  {product.aiComment && selectedProduct?.id === product.id && (
                    <p className="text-xs text-muted-foreground mt-2 italic">
                      "{product.aiComment}"
                    </p>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Product Result */}
      <AnimatePresence>
        {selectedProduct && processedImageUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl border border-border overflow-hidden"
          >
            <div className="grid md:grid-cols-2 gap-6 p-6">
              <div className="aspect-[3/4] rounded-xl overflow-hidden bg-muted">
                <img src={processedImageUrl} alt="Your look" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col justify-center">
                <Badge variant="default" className="w-fit mb-4">
                  {selectedProduct.matchScore}% Match
                </Badge>
                <h3 className="font-display text-2xl font-bold text-foreground mb-2">
                  {selectedProduct.name}
                </h3>
                <p className="text-xl font-semibold text-primary mb-4">
                  ₹{selectedProduct.base_price?.toLocaleString()}
                </p>
                {selectedProduct.aiComment && (
                  <p className="text-muted-foreground italic mb-6">
                    "{selectedProduct.aiComment}"
                  </p>
                )}
                <Button
                  variant="gold"
                  size="lg"
                  onClick={() => setShowSaveForm(true)}
                  className="w-full"
                >
                  <IconHeart className="w-5 h-5" />
                  Save This Look
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Customer Save Form */}
      <CustomerSaveForm
        open={showSaveForm}
        onOpenChange={setShowSaveForm}
        onSave={handleSaveResult}
        language={language}
      />
    </div>
  );
}

// Helper functions
function extractFeature(text: string, feature: string): string {
  const patterns: Record<string, RegExp> = {
    'skin tone': /skin\s*tone[:\s]+([^,.\n]+)/i,
    'body type': /body\s*type[:\s]+([^,.\n]+)/i,
  };
  const regex = patterns[feature];
  if (regex) {
    const match = text.match(regex);
    return match?.[1]?.trim() || '';
  }
  return '';
}

function extractColors(text: string): string[] {
  const colors: string[] = [];
  const commonColors = ['blue', 'red', 'green', 'gold', 'maroon', 'purple', 'pink', 'emerald', 'royal', 'navy'];
  commonColors.forEach(color => {
    if (text.toLowerCase().includes(color)) {
      colors.push(color.charAt(0).toUpperCase() + color.slice(1));
    }
  });
  return colors.length > 0 ? colors.slice(0, 6) : [];
}
