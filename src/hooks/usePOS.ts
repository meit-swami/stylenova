import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  image?: string;
  color?: string;
  size?: string;
}

interface CustomerInfo {
  name: string;
  phone: string;
}

export function usePOS() {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({ name: '', phone: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastOrderNumber, setLastOrderNumber] = useState<string | null>(null);

  // Tax rate (GST 18%)
  const TAX_RATE = 0.18;

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = (subtotal * discount) / 100;
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = taxableAmount * TAX_RATE;
  const total = taxableAmount + taxAmount;

  // Add item to cart
  const addToCart = useCallback((item: Omit<CartItem, 'quantity'>) => {
    setCart(prev => {
      const existing = prev.find(
        i => i.productId === item.productId && i.variantId === item.variantId
      );
      
      if (existing) {
        return prev.map(i =>
          i.id === existing.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      
      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  // Update item quantity
  const updateQuantity = useCallback((itemId: string, change: number) => {
    setCart(prev =>
      prev
        .map(item =>
          item.id === itemId
            ? { ...item, quantity: Math.max(0, item.quantity + change) }
            : item
        )
        .filter(item => item.quantity > 0)
    );
  }, []);

  // Remove item from cart
  const removeFromCart = useCallback((itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  }, []);

  // Clear cart
  const clearCart = useCallback(() => {
    setCart([]);
    setDiscount(0);
    setCustomerInfo({ name: '', phone: '' });
  }, []);

  // Generate order number
  const generateOrderNumber = () => {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ORD-${dateStr}-${random}`;
  };

  // Complete sale
  const completeSale = useCallback(async (
    paymentMethod: 'cash' | 'card' | 'upi',
    storeId: string
  ) => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return null;
    }

    setIsProcessing(true);

    try {
      const orderNumber = generateOrderNumber();

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          store_id: storeId,
          customer_name: customerInfo.name || null,
          customer_phone: customerInfo.phone || null,
          subtotal,
          discount_percent: discount,
          discount_amount: discountAmount,
          tax_percent: TAX_RATE * 100,
          tax_amount: taxAmount,
          total,
          payment_method: paymentMethod,
          status: 'completed',
          created_by: user?.id,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cart.map(item => ({
        order_id: order.id,
        product_id: item.productId,
        variant_id: item.variantId || null,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Update inventory (decrease stock)
      for (const item of cart) {
        if (item.variantId) {
          // Record inventory movement
          await supabase.from('inventory_movements').insert({
            variant_id: item.variantId,
            movement_type: 'sale',
            quantity_change: -item.quantity,
            reference_id: order.id,
            notes: `Sale: Order ${orderNumber}`,
            created_by: user?.id,
          });

          // Update stock quantity
          const { data: variant } = await supabase
            .from('product_variants')
            .select('stock_quantity')
            .eq('id', item.variantId)
            .single();

          if (variant) {
            await supabase
              .from('product_variants')
              .update({ stock_quantity: variant.stock_quantity - item.quantity })
              .eq('id', item.variantId);
          }
        }
      }

      setLastOrderNumber(orderNumber);
      clearCart();
      toast.success(`Sale completed! Order: ${orderNumber}`);

      return {
        orderNumber,
        orderId: order.id,
        total,
        paymentMethod,
        items: cart,
      };
    } catch (error: any) {
      console.error('Sale error:', error);
      toast.error('Failed to complete sale');
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [cart, customerInfo, discount, subtotal, discountAmount, taxAmount, total, user, clearCart]);

  // Search products
  const searchProducts = useCallback(async (query: string, storeId: string) => {
    if (!query || query.length < 2) return [];

    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          sku,
          base_price,
          sale_price,
          images,
          product_variants (
            id,
            sku,
            color,
            size,
            stock_quantity,
            price_adjustment
          )
        `)
        .eq('store_id', storeId)
        .eq('is_active', true)
        .or(`name.ilike.%${query}%,sku.ilike.%${query}%`)
        .limit(10);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  }, []);

  return {
    // Cart state
    cart,
    discount,
    customerInfo,
    isProcessing,
    lastOrderNumber,

    // Calculated values
    subtotal,
    discountAmount,
    taxAmount,
    total,
    TAX_RATE,

    // Cart actions
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    setDiscount,
    setCustomerInfo,

    // Sale actions
    completeSale,
    searchProducts,
  };
}
