import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image: string;
  productId?: string;
}

interface CustomerInfo {
  name: string;
  phone: string;
}

interface SaveWishlistParams {
  storeId: string;
  sessionId: string;
  customerName: string;
  customerPhone: string;
  items: WishlistItem[];
}

export function useKioskWishlist(storeId: string | undefined) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({ name: '', phone: '' });
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Create a try-on session
  const createSession = useMutation({
    mutationFn: async (data: {
      storeId: string;
      capturedImage?: string;
      customerName?: string;
      customerPhone?: string;
    }) => {
      const { data: session, error } = await supabase
        .from('tryon_sessions')
        .insert({
          store_id: data.storeId,
          customer_name: data.customerName || null,
          customer_phone: data.customerPhone || null,
          captured_images: data.capturedImage ? [data.capturedImage] : [],
        })
        .select()
        .single();

      if (error) throw error;
      return session;
    },
    onSuccess: (session) => {
      setSessionId(session.id);
    },
  });

  // Save wishlist to database
  const saveWishlist = useMutation({
    mutationFn: async (params: SaveWishlistParams) => {
      // First create the wishlist record
      const { data: wishlistRecord, error: wishlistError } = await supabase
        .from('wishlists')
        .insert({
          store_id: params.storeId,
          session_id: params.sessionId,
          customer_name: params.customerName,
          customer_phone: params.customerPhone,
          is_public: true,
        })
        .select()
        .single();

      if (wishlistError) throw wishlistError;

      // Create tryon results for each wishlist item
      for (const item of params.items) {
        // Create tryon result
        const { data: tryonResult, error: tryonError } = await supabase
          .from('tryon_results')
          .insert({
            session_id: params.sessionId,
            product_id: item.productId || item.id,
            match_score: 85, // Default match score
            ai_comment: 'Added to wishlist',
          })
          .select()
          .single();

        if (tryonError) {
          console.error('Error creating tryon result:', tryonError);
          continue;
        }

        // Link to wishlist
        await supabase.from('wishlist_items').insert({
          wishlist_id: wishlistRecord.id,
          tryon_result_id: tryonResult.id,
        });
      }

      // Generate share URL
      const shareUrl = `${window.location.origin}/wishlist/${wishlistRecord.id}`;
      
      // Update wishlist with share URL
      await supabase
        .from('wishlists')
        .update({ share_url: shareUrl })
        .eq('id', wishlistRecord.id);

      return { ...wishlistRecord, share_url: shareUrl };
    },
    onSuccess: (data) => {
      toast.success('Wishlist saved successfully!');
      return data;
    },
    onError: (error: any) => {
      console.error('Save wishlist error:', error);
      toast.error('Failed to save wishlist');
    },
  });

  const addToWishlist = useCallback((item: WishlistItem) => {
    setWishlist((prev) => {
      if (prev.some((i) => i.id === item.id)) {
        return prev;
      }
      return [...prev, item];
    });
  }, []);

  const removeFromWishlist = useCallback((id: string) => {
    setWishlist((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearWishlist = useCallback(() => {
    setWishlist([]);
  }, []);

  const initSession = useCallback(
    async (capturedImage?: string) => {
      if (!storeId) return null;

      try {
        const session = await createSession.mutateAsync({
          storeId,
          capturedImage,
          customerName: customerInfo.name,
          customerPhone: customerInfo.phone,
        });
        return session;
      } catch (error) {
        console.error('Failed to create session:', error);
        return null;
      }
    },
    [storeId, customerInfo, createSession]
  );

  const saveCurrentWishlist = useCallback(async () => {
    if (!storeId || !sessionId || wishlist.length === 0) {
      if (!customerInfo.name || !customerInfo.phone) {
        toast.error('Please enter your name and phone number');
        return null;
      }
      if (wishlist.length === 0) {
        toast.error('Wishlist is empty');
        return null;
      }
      return null;
    }

    try {
      const result = await saveWishlist.mutateAsync({
        storeId,
        sessionId,
        customerName: customerInfo.name,
        customerPhone: customerInfo.phone,
        items: wishlist,
      });
      return result;
    } catch (error) {
      return null;
    }
  }, [storeId, sessionId, wishlist, customerInfo, saveWishlist]);

  return {
    wishlist,
    customerInfo,
    sessionId,
    isCreatingSession: createSession.isPending,
    isSavingWishlist: saveWishlist.isPending,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    setCustomerInfo,
    initSession,
    saveCurrentWishlist,
  };
}
