import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Fetch store by owner
export function useStore(userId: string | undefined) {
  return useQuery({
    queryKey: ['store', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('owner_id', userId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

// Fetch subscription plans
export function useSubscriptionPlans() {
  return useQuery({
    queryKey: ['subscription_plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('yearly_price', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });
}

// Create store mutation
export function useCreateStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (storeData: {
      name: string;
      owner_id: string;
      brand_name?: string;
      address?: string;
      owner_name?: string;
      category?: 'small' | 'medium' | 'large';
    }) => {
      const { data, error } = await supabase
        .from('stores')
        .insert(storeData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store'] });
      toast.success('Store created successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Fetch products for a store
export function useProducts(storeId: string | undefined) {
  return useQuery({
    queryKey: ['products', storeId],
    queryFn: async () => {
      if (!storeId) return [];
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_categories(name),
          product_variants(*)
        `)
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!storeId,
  });
}

// Create product mutation
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productData: {
      store_id: string;
      name: string;
      sku: string;
      base_price: number;
      description?: string;
      category_id?: string;
      sale_price?: number;
      images?: string[];
    }) => {
      const { data, error } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products', data.store_id] });
      toast.success('Product created successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Fetch orders for a store
export function useOrders(storeId: string | undefined) {
  return useQuery({
    queryKey: ['orders', storeId],
    queryFn: async () => {
      if (!storeId) return [];
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(
            *,
            products(name),
            product_variants(size, color)
          )
        `)
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!storeId,
  });
}

// Create order mutation
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderData: {
      store_id: string;
      order_number: string;
      subtotal: number;
      tax_amount: number;
      total: number;
      customer_name?: string;
      customer_phone?: string;
      discount_percent?: number;
      discount_amount?: number;
      payment_method?: string;
      created_by?: string;
    }) => {
      const { data, error } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['orders', data.store_id] });
      toast.success('Order created successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Fetch try-on sessions
export function useTryOnSessions(storeId: string | undefined) {
  return useQuery({
    queryKey: ['tryon_sessions', storeId],
    queryFn: async () => {
      if (!storeId) return [];
      const { data, error } = await supabase
        .from('tryon_sessions')
        .select(`
          *,
          tryon_results(
            *,
            products(name, base_price)
          )
        `)
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!storeId,
  });
}

// Create try-on session
export function useCreateTryOnSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionData: {
      store_id: string;
      customer_name?: string;
      customer_phone?: string;
      detected_skin_tone?: string;
      detected_body_type?: string;
      detected_height?: string;
      favorite_colors?: string[];
      captured_images?: string[];
    }) => {
      const { data, error } = await supabase
        .from('tryon_sessions')
        .insert(sessionData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tryon_sessions', data.store_id] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Superadmin: Fetch all stores
export function useAllStores() {
  return useQuery({
    queryKey: ['all_stores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stores')
        .select(`
          *,
          subscriptions(*, subscription_plans(*))
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
}

// Superadmin: Fetch tablet requests
export function useTabletRequests() {
  return useQuery({
    queryKey: ['tablet_requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tablet_requests')
        .select(`
          *,
          stores(name, owner_name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
}

// Update tablet request status
export function useUpdateTabletRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, admin_notes }: { 
      id: string; 
      status: 'approved' | 'rejected' | 'delivered';
      admin_notes?: string;
    }) => {
      const { data, error } = await supabase
        .from('tablet_requests')
        .update({ 
          status, 
          admin_notes,
          processed_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tablet_requests'] });
      toast.success('Request updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
