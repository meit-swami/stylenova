import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type Product = Database['public']['Tables']['products']['Row'];
type ProductInsert = Database['public']['Tables']['products']['Insert'];
type ProductVariant = Database['public']['Tables']['product_variants']['Row'];
type ProductCategory = Database['public']['Tables']['product_categories']['Row'];

interface CreateProductData {
  name: string;
  sku: string;
  description?: string;
  base_price: number;
  sale_price?: number;
  category_id?: string;
  images?: string[];
  enable_tryon?: boolean;
  store_id: string;
  variants?: {
    sku: string;
    color?: string;
    size?: string;
    stock_quantity: number;
    price_adjustment?: number;
    images?: string[];
  }[];
}

// Fetch products with variants and categories
export function useProductsWithDetails(storeId: string | undefined) {
  return useQuery({
    queryKey: ['products-detailed', storeId],
    queryFn: async () => {
      if (!storeId) return [];
      
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:product_categories(*),
          variants:product_variants(*)
        `)
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!storeId,
  });
}

// Fetch categories
export function useCategories(storeId: string | undefined) {
  return useQuery({
    queryKey: ['categories', storeId],
    queryFn: async () => {
      if (!storeId) return [];
      
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .eq('store_id', storeId)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!storeId,
  });
}

// Create category
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; slug: string; description?: string; store_id: string }) => {
      const { data: category, error } = await supabase
        .from('product_categories')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return category;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['categories', variables.store_id] });
      toast.success('Category created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create category');
    },
  });
}

// Create product with variants
export function useCreateProductWithVariants() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateProductData) => {
      const { variants, ...productData } = data;

      // Create product
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single();

      if (productError) throw productError;

      // Create variants if provided
      if (variants && variants.length > 0) {
        const variantsWithProductId = variants.map(v => ({
          ...v,
          product_id: product.id,
        }));

        const { error: variantsError } = await supabase
          .from('product_variants')
          .insert(variantsWithProductId);

        if (variantsError) throw variantsError;
      }

      return product;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products-detailed', variables.store_id] });
      queryClient.invalidateQueries({ queryKey: ['products', variables.store_id] });
      toast.success('Product created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create product');
    },
  });
}

// Update product
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Product> & { id: string }) => {
      const { data: product, error } = await supabase
        .from('products')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return product;
    },
    onSuccess: (product) => {
      queryClient.invalidateQueries({ queryKey: ['products-detailed', product.store_id] });
      queryClient.invalidateQueries({ queryKey: ['products', product.store_id] });
      toast.success('Product updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update product');
    },
  });
}

// Delete product
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, storeId }: { id: string; storeId: string }) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { id, storeId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products-detailed', data.storeId] });
      queryClient.invalidateQueries({ queryKey: ['products', data.storeId] });
      toast.success('Product deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete product');
    },
  });
}

// Add variant to product
export function useAddVariant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Database['public']['Tables']['product_variants']['Insert']) => {
      const { data: variant, error } = await supabase
        .from('product_variants')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return variant;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products-detailed'] });
      toast.success('Variant added successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add variant');
    },
  });
}

// Update variant
export function useUpdateVariant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<ProductVariant> & { id: string }) => {
      const { data: variant, error } = await supabase
        .from('product_variants')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return variant;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products-detailed'] });
      toast.success('Variant updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update variant');
    },
  });
}
