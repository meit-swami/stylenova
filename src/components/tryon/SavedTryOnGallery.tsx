import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  IconPhoto,
  IconLoader2,
  IconTrash,
  IconDownload,
  IconEye,
  IconCalendar,
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface SavedResult {
  id: string;
  analysis_type: string;
  customer_image_url?: string;
  customer_image_base64?: string;
  product_name?: string;
  product_category?: string;
  product_images?: string[];
  detected_features?: Record<string, any>;
  ai_comment?: string;
  match_score?: number;
  processed_image_url?: string;
  created_at: string;
}

interface SavedTryOnGalleryProps {
  storeId?: string;
}

export function SavedTryOnGallery({ storeId }: SavedTryOnGalleryProps) {
  const [results, setResults] = useState<SavedResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState<SavedResult | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  useEffect(() => {
    if (!storeId) {
      setIsLoading(false);
      return;
    }

    const fetchResults = async () => {
      try {
        // Use any to bypass type checking since table was just created
        const { data, error } = await (supabase
          .from('virtual_tryon_results') as any)
          .select('*')
          .eq('store_id', storeId)
          .eq('is_saved', true)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) throw error;
        setResults((data as SavedResult[]) || []);
      } catch (error) {
        console.error('Error fetching saved results:', error);
        toast.error('Failed to load saved results');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [storeId]);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await (supabase
        .from('virtual_tryon_results') as any)
        .delete()
        .eq('id', id);

      if (error) throw error;

      setResults(prev => prev.filter(r => r.id !== id));
      toast.success('Result deleted');
    } catch (error) {
      console.error('Error deleting result:', error);
      toast.error('Failed to delete result');
    }
  };

  const handleView = (result: SavedResult) => {
    setSelectedResult(result);
    setShowDetailDialog(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <IconLoader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="bg-card rounded-2xl border border-border p-8 text-center">
        <IconPhoto className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-display text-lg font-semibold text-foreground mb-2">
          No Saved Results
        </h3>
        <p className="text-muted-foreground">
          Your saved virtual try-on results will appear here.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <IconPhoto className="w-5 h-5 text-primary" />
          Saved Results ({results.length})
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {results.map((result, index) => (
            <motion.div
              key={result.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group relative aspect-[3/4] rounded-xl overflow-hidden border border-border"
            >
              <div className="w-full h-full bg-muted flex items-center justify-center">
                {result.customer_image_url || result.product_images?.[0] ? (
                  <img
                    src={result.customer_image_url || result.product_images?.[0]}
                    alt={result.product_name || 'Try-on result'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <IconPhoto className="w-8 h-8 text-muted-foreground" />
                )}
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="font-medium text-white text-sm truncate mb-1">
                    {result.product_name || 'Try-on Result'}
                  </p>
                  <div className="flex items-center justify-between text-xs text-white/70">
                    <span>{result.match_score}% match</span>
                    <span>{format(new Date(result.created_at), 'MMM d')}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="absolute top-2 right-2 flex gap-1">
                  <button
                    onClick={() => handleView(result)}
                    className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                  >
                    <IconEye className="w-3.5 h-3.5 text-white" />
                  </button>
                  <button
                    onClick={() => handleDelete(result.id)}
                    className="p-1.5 rounded-full bg-destructive/80 hover:bg-destructive transition-colors"
                  >
                    <IconTrash className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              </div>

              {/* Type Badge */}
              <Badge
                className="absolute top-2 left-2 text-[10px]"
                variant={result.analysis_type === 'live_photo' ? 'secondary' : 'default'}
              >
                {result.analysis_type === 'live_photo' ? 'Photo' : 'eCom'}
              </Badge>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedResult?.product_name || 'Try-On Result'}</DialogTitle>
          </DialogHeader>

          {selectedResult && (
            <div className="space-y-4">
              {/* Image */}
              <div className="aspect-[4/3] rounded-xl overflow-hidden bg-muted">
                {selectedResult.customer_image_url || selectedResult.product_images?.[0] ? (
                  <img
                    src={selectedResult.customer_image_url || selectedResult.product_images?.[0]}
                    alt="Result"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <IconPhoto className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">Type</p>
                  <p className="font-medium text-foreground">
                    {selectedResult.analysis_type === 'live_photo' ? 'Live Photo Analysis' : 'eCom Virtual Try-On'}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">Match Score</p>
                  <p className="font-medium text-foreground">{selectedResult.match_score}%</p>
                </div>
              </div>

              {/* AI Comment */}
              {selectedResult.ai_comment && (
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                  <p className="text-sm text-muted-foreground mb-1">AI Comment</p>
                  <p className="italic text-foreground">"{selectedResult.ai_comment}"</p>
                </div>
              )}

              {/* Detected Features */}
              {selectedResult.detected_features && Object.keys(selectedResult.detected_features).length > 0 && (
                <div className="p-4 rounded-xl bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-2">Detected Features</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(selectedResult.detected_features).map(([key, value]) => (
                      <Badge key={key} variant="outline">
                        {key}: {typeof value === 'string' ? value : JSON.stringify(value)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Created Date */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <IconCalendar className="w-4 h-4" />
                Created {format(new Date(selectedResult.created_at), 'PPpp')}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <IconDownload className="w-4 h-4" />
                  Download
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleDelete(selectedResult.id);
                    setShowDetailDialog(false);
                  }}
                >
                  <IconTrash className="w-4 h-4" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
