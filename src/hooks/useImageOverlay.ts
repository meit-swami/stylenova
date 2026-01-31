import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UseImageOverlayOptions {
  onSuccess?: (imageUrl: string) => void;
  onError?: (error: Error) => void;
}

interface OverlayResult {
  processedImageUrl: string;
  aiComment: string;
  success: boolean;
  fallback?: boolean;
}

export function useImageOverlay({ onSuccess, onError }: UseImageOverlayOptions = {}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<OverlayResult | null>(null);

  const generateOverlay = useCallback(async (
    personImage: string,
    productImages: string[],
    productName: string,
    productCategory: string
  ): Promise<OverlayResult | null> => {
    setIsProcessing(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-tryon-image', {
        body: {
          personImage,
          productImages,
          productName,
          productCategory,
        },
      });

      if (error) throw error;

      const overlayResult: OverlayResult = {
        processedImageUrl: data.processedImageUrl || personImage,
        aiComment: data.aiComment || 'This outfit looks great on you!',
        success: data.success ?? false,
        fallback: data.fallback,
      };

      setResult(overlayResult);
      
      if (overlayResult.success) {
        onSuccess?.(overlayResult.processedImageUrl);
      } else if (overlayResult.fallback) {
        toast.info('Using original photo. AI image generation in progress...');
      }

      return overlayResult;
    } catch (error: any) {
      console.error('Image overlay error:', error);
      
      const fallbackResult: OverlayResult = {
        processedImageUrl: personImage,
        aiComment: 'Virtual styling complete!',
        success: false,
        fallback: true,
      };
      
      setResult(fallbackResult);
      onError?.(error);
      
      return fallbackResult;
    } finally {
      setIsProcessing(false);
    }
  }, [onSuccess, onError]);

  const reset = useCallback(() => {
    setResult(null);
  }, []);

  return {
    generateOverlay,
    reset,
    isProcessing,
    result,
  };
}
