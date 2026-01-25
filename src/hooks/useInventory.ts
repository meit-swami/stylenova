import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import type { Database } from '@/integrations/supabase/types';

type Product = Database['public']['Tables']['products']['Row'];
type ProductVariant = Database['public']['Tables']['product_variants']['Row'];
type ProductCategory = Database['public']['Tables']['product_categories']['Row'];

// Hook for real-time inventory updates
export function useRealtimeInventory(storeId: string | undefined) {
  const queryClient = useQueryClient();
  const [lowStockAlerts, setLowStockAlerts] = useState<any[]>([]);

  useEffect(() => {
    if (!storeId) return;

    const channel = supabase
      .channel('inventory-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'product_variants',
        },
        (payload) => {
          console.log('Inventory change:', payload);
          
          // Invalidate queries to refresh data
          queryClient.invalidateQueries({ queryKey: ['products', storeId] });
          queryClient.invalidateQueries({ queryKey: ['inventory-stats', storeId] });
          queryClient.invalidateQueries({ queryKey: ['low-stock', storeId] });

          // Check for low stock alert
          if (payload.new && (payload.new as ProductVariant).stock_quantity <= ((payload.new as ProductVariant).low_stock_threshold || 5)) {
            toast.warning(`Low stock alert: ${(payload.new as ProductVariant).sku}`, {
              description: `Only ${(payload.new as ProductVariant).stock_quantity} units remaining`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [storeId, queryClient]);

  return { lowStockAlerts };
}

// Fetch low stock items with reorder suggestions
export function useLowStockItems(storeId: string | undefined) {
  return useQuery({
    queryKey: ['low-stock', storeId],
    queryFn: async () => {
      if (!storeId) return [];
      
      const { data, error } = await supabase
        .rpc('get_low_stock_items', { p_store_id: storeId });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!storeId,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

// Fetch inventory statistics
export function useInventoryStats(storeId: string | undefined) {
  return useQuery({
    queryKey: ['inventory-stats', storeId],
    queryFn: async () => {
      if (!storeId) return null;
      
      // Get product counts by stock status
      const { data: variants, error } = await supabase
        .from('product_variants')
        .select(`
          id,
          stock_quantity,
          low_stock_threshold,
          products!inner(store_id)
        `)
        .eq('products.store_id', storeId);

      if (error) throw error;

      const stats = {
        totalVariants: variants?.length || 0,
        inStock: variants?.filter(v => v.stock_quantity > (v.low_stock_threshold || 5)).length || 0,
        lowStock: variants?.filter(v => v.stock_quantity > 0 && v.stock_quantity <= (v.low_stock_threshold || 5)).length || 0,
        outOfStock: variants?.filter(v => v.stock_quantity === 0).length || 0,
        totalUnits: variants?.reduce((sum, v) => sum + v.stock_quantity, 0) || 0,
      };

      return stats;
    },
    enabled: !!storeId,
  });
}

// Update stock quantity
export function useUpdateStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      variantId, 
      quantity, 
      movementType, 
      notes 
    }: { 
      variantId: string; 
      quantity: number; 
      movementType: 'restock' | 'sale' | 'adjustment' | 'return';
      notes?: string;
    }) => {
      // Get current stock
      const { data: variant, error: fetchError } = await supabase
        .from('product_variants')
        .select('stock_quantity')
        .eq('id', variantId)
        .single();

      if (fetchError) throw fetchError;

      const quantityChange = movementType === 'sale' ? -Math.abs(quantity) : 
                            movementType === 'adjustment' ? quantity :
                            Math.abs(quantity);

      const newQuantity = Math.max(0, (variant?.stock_quantity || 0) + quantityChange);

      // Update stock
      const { error: updateError } = await supabase
        .from('product_variants')
        .update({ stock_quantity: newQuantity })
        .eq('id', variantId);

      if (updateError) throw updateError;

      // Record movement
      const { error: movementError } = await supabase
        .from('inventory_movements')
        .insert({
          variant_id: variantId,
          movement_type: movementType,
          quantity_change: quantityChange,
          notes,
        });

      if (movementError) throw movementError;

      return { variantId, newQuantity };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-stats'] });
      queryClient.invalidateQueries({ queryKey: ['low-stock'] });
      toast.success('Stock updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update stock');
    },
  });
}

// Fetch inventory movements history
export function useInventoryMovements(variantId: string | undefined) {
  return useQuery({
    queryKey: ['inventory-movements', variantId],
    queryFn: async () => {
      if (!variantId) return [];
      
      const { data, error } = await supabase
        .from('inventory_movements')
        .select('*')
        .eq('variant_id', variantId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    },
    enabled: !!variantId,
  });
}
