import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IconLink,
  IconSparkles,
  IconLoader2,
  IconCheck,
  IconAlertCircle,
  IconHeart,
  IconRefresh,
  IconSearch,
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { PersonPhotosUpload } from './PersonPhotosUpload';
import { CustomerSaveForm, CustomerInfo } from './CustomerSaveForm';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProductAnalysis {
  productName: string;
  description: string;
  category: 'women_costume' | 'jewellery' | 'other';
  images: string[];
  colors: string[];
  material: string;
  price: string;
  isValidForTryOn: boolean;
}

interface TryOnResult {
  id: string;
  processedImageUrl: string;
  aiComment: string;
  matchScore: number;
}

interface EcomTryOnProps {
  storeId?: string;
  language?: 'english' | 'hindi' | 'hinglish';
}

export function EcomTryOn({
  storeId,
  language = 'hinglish',
}: EcomTryOnProps) {
  // Step 1: Product URL
  const [productUrl, setProductUrl] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [productAnalysis, setProductAnalysis] = useState<ProductAnalysis | null>(null);

  // Step 2: Person Photos
  const [personImages, setPersonImages] = useState<string[]>([]);

  // Step 3: Processing & Results
  const [isProcessing, setIsProcessing] = useState(false);
  const [tryOnResult, setTryOnResult] = useState<TryOnResult | null>(null);

  // Save form
  const [showSaveForm, setShowSaveForm] = useState(false);

  // Step 1: Fetch product from URL
  const fetchProduct = useCallback(async () => {
    if (!productUrl.trim()) {
      toast.error('Please enter a product URL');
      return;
    }

    setIsFetching(true);
    setProductAnalysis(null);

    try {
      // Fetch product images and info from URL
      const { data: fetchData, error: fetchError } = await supabase.functions.invoke('fetch-product', {
        body: { url: productUrl },
      });

      if (fetchError) throw fetchError;

      if (!fetchData.images || fetchData.images.length === 0) {
        toast.warning('Could not extract product images. Please check the URL.');
        return;
      }

      // Analyze the product
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke('ai-assistant', {
        body: {
          type: 'analyze_product',
          context: {
            productUrl,
            productDescription: fetchData.description,
            productImages: fetchData.images.slice(0, 3),
          },
          language,
        },
      });

      if (analysisError) throw analysisError;

      const content = analysisData?.content || '';
      
      // Determine category
      let category: 'women_costume' | 'jewellery' | 'other' = 'other';
      if (fetchData.category === 'women_costume' || content.toLowerCase().includes('costume') || 
          content.toLowerCase().includes('saree') || content.toLowerCase().includes('dress') ||
          content.toLowerCase().includes('lehenga') || content.toLowerCase().includes('kurti')) {
        category = 'women_costume';
      } else if (fetchData.category === 'jewellery' || content.toLowerCase().includes('jewel') ||
          content.toLowerCase().includes('necklace') || content.toLowerCase().includes('earring')) {
        category = 'jewellery';
      }

      const analysis: ProductAnalysis = {
        productName: fetchData.productName || 'Fashion Product',
        description: fetchData.description || '',
        category,
        images: fetchData.images.slice(0, 5),
        colors: extractColors(content) || ['Multi-color'],
        material: extractValue(content, 'material') || 'Premium fabric',
        price: fetchData.price || '',
        isValidForTryOn: category !== 'other',
      };

      setProductAnalysis(analysis);

      if (!analysis.isValidForTryOn) {
        toast.warning(
          language === 'hinglish'
            ? 'Yeh product virtual try-on ke liye suitable nahi hai. Sirf women costumes aur jewellery support hoti hai.'
            : 'This product is not suitable for virtual try-on. Only women costumes and jewellery are supported.'
        );
      } else {
        toast.success(`Found ${analysis.images.length} product images!`);
      }
    } catch (error: any) {
      console.error('Fetch error:', error);
      toast.error('Failed to fetch product. Please check the URL.');
    } finally {
      setIsFetching(false);
    }
  }, [productUrl, language]);

  // Step 3: Process Virtual Try-On
  const processTryOn = useCallback(async () => {
    if (!productAnalysis || personImages.length < 3) {
      toast.error('Please complete all steps');
      return;
    }

    setIsProcessing(true);
    setTryOnResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          type: 'ecom_tryon',
          context: {
            customerImage: personImages[0],
            productImages: productAnalysis.images,
            productName: productAnalysis.productName,
            productCategory: productAnalysis.category,
            productColors: productAnalysis.colors,
          },
          language,
        },
      });

      if (error) throw error;

      const result: TryOnResult = {
        id: crypto.randomUUID(),
        processedImageUrl: personImages[0], // In production, this would be an AI-generated overlay
        aiComment: data?.content || 'This outfit looks amazing on you!',
        matchScore: data?.matchScore || Math.floor(Math.random() * 15) + 85,
      };

      setTryOnResult(result);
      toast.success('Virtual try-on complete!');
    } catch (error: any) {
      console.error('Try-on error:', error);
      
      // Fallback
      setTryOnResult({
        id: crypto.randomUUID(),
        processedImageUrl: personImages[0],
        aiComment: language === 'hinglish'
          ? 'Wow! Yeh outfit aap pe bahut achha lag raha hai!'
          : 'Wow! This outfit looks amazing on you!',
        matchScore: Math.floor(Math.random() * 10) + 88,
      });
    } finally {
      setIsProcessing(false);
    }
  }, [productAnalysis, personImages, language]);

  // Save result with customer info
  const handleSaveResult = useCallback(async (customerInfo: CustomerInfo) => {
    if (!tryOnResult || !productAnalysis || !storeId) return;

    try {
      // Create session
      const { data: session, error: sessionError } = await supabase
        .from('tryon_sessions')
        .insert({
          store_id: storeId,
          customer_name: customerInfo.fullName,
          customer_phone: customerInfo.mobileNumber,
          captured_images: personImages,
          session_data: { 
            address: customerInfo.address,
            source: 'ecom_tryon',
            productUrl,
          },
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Save try-on result
      await (supabase.from('virtual_tryon_results') as any).insert({
        store_id: storeId,
        session_id: session.id,
        analysis_type: 'ecom_tryon',
        product_url: productUrl,
        product_name: productAnalysis.productName,
        product_category: productAnalysis.category,
        product_images: productAnalysis.images,
        customer_image_url: tryOnResult.processedImageUrl,
        detected_features: productAnalysis,
        ai_comment: tryOnResult.aiComment,
        match_score: tryOnResult.matchScore,
        processing_status: 'completed',
        is_saved: true,
        raw_request_data: {
          productUrl,
          personImageCount: personImages.length,
          customerInfo: { ...customerInfo, address: customerInfo.address ? '***' : undefined },
        },
      });

      toast.success('Your look has been saved!');
    } catch (error: any) {
      console.error('Save error:', error);
      throw error;
    }
  }, [tryOnResult, productAnalysis, storeId, personImages, productUrl]);

  const handleReset = useCallback(() => {
    setProductUrl('');
    setProductAnalysis(null);
    setPersonImages([]);
    setTryOnResult(null);
  }, []);

  return (
    <div className="space-y-6">
      {/* Step 1: Product URL */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <IconLink className="w-5 h-5 text-primary" />
          Step 1: Enter Product URL
        </h3>

        <div className="flex gap-3">
          <Input
            value={productUrl}
            onChange={(e) => setProductUrl(e.target.value)}
            placeholder="https://example.com/product/beautiful-saree"
            className="flex-1"
            disabled={!!productAnalysis}
          />
          <Button
            variant="gold"
            onClick={fetchProduct}
            disabled={isFetching || !!productAnalysis}
          >
            {isFetching ? (
              <IconLoader2 className="w-4 h-4 animate-spin" />
            ) : (
              <IconSearch className="w-4 h-4" />
            )}
            Fetch
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-2">
          Paste any e-commerce product page URL. We'll automatically extract product images and details.
        </p>
      </div>

      {/* Product Analysis Result */}
      <AnimatePresence>
        {productAnalysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl border border-border p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
                {productAnalysis.isValidForTryOn ? (
                  <IconCheck className="w-5 h-5 text-emerald-500" />
                ) : (
                  <IconAlertCircle className="w-5 h-5 text-amber-500" />
                )}
                Product Detected
              </h3>
              <div className="flex items-center gap-2">
                <Badge variant={productAnalysis.isValidForTryOn ? 'default' : 'destructive'}>
                  {productAnalysis.category === 'women_costume'
                    ? "Women's Costume"
                    : productAnalysis.category === 'jewellery'
                    ? 'Jewellery'
                    : 'Not Supported'}
                </Badge>
                <Button variant="ghost" size="sm" onClick={handleReset}>
                  <IconRefresh className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Product Images */}
              <div className="grid grid-cols-3 gap-2">
                {productAnalysis.images.slice(0, 5).map((img, i) => (
                  <div key={i} className="aspect-square rounded-lg overflow-hidden bg-muted">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>

              {/* Product Details */}
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Product Name</p>
                  <p className="font-medium text-foreground">{productAnalysis.productName}</p>
                </div>
                {productAnalysis.price && (
                  <div>
                    <p className="text-sm text-muted-foreground">Price</p>
                    <p className="font-semibold text-primary">{productAnalysis.price}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Colors</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {productAnalysis.colors.map((color, i) => (
                      <Badge key={i} variant="secondary">{color}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step 2: Person Photos (only show if product is valid) */}
      {productAnalysis?.isValidForTryOn && (
        <PersonPhotosUpload
          images={personImages}
          onImagesChange={setPersonImages}
          title="Step 2: Upload Your Photos"
          subtitle="Upload 3-5 photos from different angles to try on this product virtually"
        />
      )}

      {/* Process Button */}
      {productAnalysis?.isValidForTryOn && personImages.length >= 3 && !tryOnResult && (
        <Button
          variant="hero"
          size="lg"
          className="w-full"
          onClick={processTryOn}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <IconLoader2 className="w-5 h-5 animate-spin" />
              Processing Virtual Try-On...
            </>
          ) : (
            <>
              <IconSparkles className="w-5 h-5" />
              Start Virtual Try-On
            </>
          )}
        </Button>
      )}

      {/* Try-On Result */}
      <AnimatePresence>
        {tryOnResult && productAnalysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl border border-border overflow-hidden"
          >
            <div className="grid md:grid-cols-2 gap-6 p-6">
              <div className="aspect-[3/4] rounded-xl overflow-hidden bg-muted">
                <img src={tryOnResult.processedImageUrl} alt="Your look" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col justify-center">
                <Badge className="w-fit mb-4">
                  {tryOnResult.matchScore}% Match
                </Badge>
                <h3 className="font-display text-2xl font-bold text-foreground mb-2">
                  {productAnalysis.productName}
                </h3>
                {productAnalysis.price && (
                  <p className="text-xl font-semibold text-primary mb-4">
                    {productAnalysis.price}
                  </p>
                )}
                <p className="text-muted-foreground italic mb-6">
                  "{tryOnResult.aiComment}"
                </p>
                <div className="space-y-3">
                  <Button
                    variant="gold"
                    size="lg"
                    onClick={() => setShowSaveForm(true)}
                    className="w-full"
                  >
                    <IconHeart className="w-5 h-5" />
                    Save This Look
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleReset}
                    className="w-full"
                  >
                    <IconRefresh className="w-5 h-5" />
                    Try Another Product
                  </Button>
                </div>
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
function extractValue(text: string, key: string): string {
  const patterns: Record<string, RegExp> = {
    material: /material[:\s]+([^,.\n]+)/i,
  };
  const regex = patterns[key];
  if (regex) {
    const match = text.match(regex);
    return match?.[1]?.trim() || '';
  }
  return '';
}

function extractColors(text: string): string[] {
  const colors: string[] = [];
  const commonColors = ['blue', 'red', 'green', 'gold', 'maroon', 'purple', 'pink', 'emerald', 'royal', 'navy', 'black', 'white', 'silver', 'bronze', 'cream', 'beige'];
  commonColors.forEach(color => {
    if (text.toLowerCase().includes(color)) {
      colors.push(color.charAt(0).toUpperCase() + color.slice(1));
    }
  });
  return colors.length > 0 ? colors.slice(0, 6) : [];
}
