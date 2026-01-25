import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { IconSparkles, IconHeart, IconShare, IconPhone } from '@tabler/icons-react';

interface WishlistItem {
  id: string;
  tryon_result: {
    id: string;
    result_image_url: string | null;
    ai_comment: string | null;
    match_score: number | null;
    product: {
      id: string;
      name: string;
      base_price: number;
      sale_price: number | null;
      images: string[] | null;
    };
  };
}

interface WishlistData {
  id: string;
  customer_name: string;
  customer_phone: string;
  is_public: boolean;
  store: {
    id: string;
    name: string;
    brand_name: string | null;
    logo_url: string | null;
    address: string | null;
  };
  items: WishlistItem[];
}

export default function PublicWishlist() {
  const { wishlistId } = useParams<{ wishlistId: string }>();
  const [wishlist, setWishlist] = useState<WishlistData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWishlist() {
      if (!wishlistId) {
        setError('Invalid wishlist link');
        setLoading(false);
        return;
      }

      try {
        // Fetch wishlist with store info
        const { data: wishlistData, error: wishlistError } = await supabase
          .from('wishlists')
          .select(`
            id,
            customer_name,
            customer_phone,
            is_public,
            stores:store_id (
              id,
              name,
              brand_name,
              logo_url,
              address
            )
          `)
          .eq('id', wishlistId)
          .single();

        if (wishlistError) throw wishlistError;

        if (!wishlistData?.is_public) {
          setError('This wishlist is private');
          setLoading(false);
          return;
        }

        // Fetch wishlist items with try-on results and products
        const { data: itemsData, error: itemsError } = await supabase
          .from('wishlist_items')
          .select(`
            id,
            tryon_results:tryon_result_id (
              id,
              result_image_url,
              ai_comment,
              match_score,
              products:product_id (
                id,
                name,
                base_price,
                sale_price,
                images
              )
            )
          `)
          .eq('wishlist_id', wishlistId);

        if (itemsError) throw itemsError;

        setWishlist({
          ...wishlistData,
          store: wishlistData.stores as any,
          items: (itemsData || []).map((item: any) => ({
            id: item.id,
            tryon_result: {
              ...item.tryon_results,
              product: item.tryon_results?.products,
            },
          })),
        });
      } catch (err: any) {
        console.error('Error fetching wishlist:', err);
        setError('Failed to load wishlist');
      } finally {
        setLoading(false);
      }
    }

    fetchWishlist();
  }, [wishlistId]);

  const handleShare = async () => {
    try {
      await navigator.share({
        title: `${wishlist?.customer_name}'s Wishlist`,
        text: `Check out my favorite looks from ${wishlist?.store.brand_name || wishlist?.store.name}!`,
        url: window.location.href,
      });
    } catch (err) {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-24 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-80 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !wishlist) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md w-full text-center p-8">
          <IconHeart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {error || 'Wishlist not found'}
          </h1>
          <p className="text-muted-foreground">
            This wishlist may have been removed or made private.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {wishlist.store.logo_url ? (
              <img 
                src={wishlist.store.logo_url} 
                alt={wishlist.store.name}
                className="w-10 h-10 rounded-lg object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <IconSparkles className="w-5 h-5 text-white" />
              </div>
            )}
            <div>
              <h1 className="font-semibold text-foreground">
                {wishlist.store.brand_name || wishlist.store.name}
              </h1>
              <p className="text-xs text-muted-foreground">{wishlist.store.address}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleShare}>
            <IconShare className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </header>

      {/* Customer Info */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Badge variant="secondary" className="mb-4">
            <IconHeart className="w-3 h-3 mr-1" />
            Wishlist
          </Badge>
          <h2 className="text-3xl font-bold text-foreground mb-2">
            {wishlist.customer_name}'s Favorites
          </h2>
          <p className="text-muted-foreground">
            {wishlist.items.length} {wishlist.items.length === 1 ? 'item' : 'items'} saved
          </p>
        </motion.div>

        {/* Items Grid */}
        {wishlist.items.length === 0 ? (
          <Card className="p-12 text-center">
            <IconHeart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No items in this wishlist yet</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {wishlist.items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden group hover:shadow-lg transition-shadow">
                  <div className="aspect-[3/4] relative bg-muted">
                    {item.tryon_result?.result_image_url ? (
                      <img
                        src={item.tryon_result.result_image_url}
                        alt={item.tryon_result.product?.name}
                        className="w-full h-full object-cover"
                      />
                    ) : item.tryon_result?.product?.images?.[0] ? (
                      <img
                        src={item.tryon_result.product.images[0]}
                        alt={item.tryon_result.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <IconSparkles className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                    
                    {item.tryon_result?.match_score && (
                      <Badge 
                        className="absolute top-3 right-3 bg-primary text-primary-foreground"
                      >
                        {Math.round(item.tryon_result.match_score)}% Match
                      </Badge>
                    )}
                  </div>
                  
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground mb-1">
                      {item.tryon_result?.product?.name || 'Product'}
                    </h3>
                    
                    <div className="flex items-center gap-2 mb-3">
                      {item.tryon_result?.product?.sale_price ? (
                        <>
                          <span className="text-lg font-bold text-primary">
                            ₹{item.tryon_result.product.sale_price.toLocaleString()}
                          </span>
                          <span className="text-sm text-muted-foreground line-through">
                            ₹{item.tryon_result.product.base_price.toLocaleString()}
                          </span>
                        </>
                      ) : (
                        <span className="text-lg font-bold text-foreground">
                          ₹{item.tryon_result?.product?.base_price?.toLocaleString() || 'N/A'}
                        </span>
                      )}
                    </div>

                    {item.tryon_result?.ai_comment && (
                      <p className="text-sm text-muted-foreground italic">
                        "{item.tryon_result.ai_comment}"
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Contact Store CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <Card className="p-8 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <h3 className="text-xl font-bold text-foreground mb-2">
              Love these looks?
            </h3>
            <p className="text-muted-foreground mb-4">
              Visit {wishlist.store.brand_name || wishlist.store.name} to try them on!
            </p>
            {wishlist.store.address && (
              <p className="text-sm text-muted-foreground mb-4">
                📍 {wishlist.store.address}
              </p>
            )}
            <Button variant="hero" size="lg">
              <IconPhone className="w-5 h-5 mr-2" />
              Contact Store
            </Button>
          </Card>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="border-t mt-12 py-6">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <IconSparkles className="w-4 h-4" />
            <span className="text-sm">Powered by StyleNova</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
