import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SendSMSParams {
  phone: string;
  message: string;
  customerName?: string;
  wishlistUrl?: string;
}

export function useSMSNotification() {
  const sendSMS = useCallback(async (params: SendSMSParams) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-sms', {
        body: params,
      });

      if (error) throw error;

      if (data?.success) {
        toast.success('SMS notification sent!');
        return { success: true, data };
      } else {
        throw new Error(data?.error || 'Failed to send SMS');
      }
    } catch (error: any) {
      console.error('SMS error:', error);
      // Don't show error to user, just log it - SMS is a nice-to-have
      return { success: false, error: error.message };
    }
  }, []);

  const sendWishlistSMS = useCallback(async (
    phone: string,
    customerName: string,
    wishlistUrl: string,
    storeName: string
  ) => {
    const message = `Hi ${customerName}! 🛍️ Your wishlist from ${storeName} is ready: ${wishlistUrl} - Happy Shopping! ✨`;
    
    return sendSMS({
      phone,
      message,
      customerName,
      wishlistUrl,
    });
  }, [sendSMS]);

  return {
    sendSMS,
    sendWishlistSMS,
  };
}
