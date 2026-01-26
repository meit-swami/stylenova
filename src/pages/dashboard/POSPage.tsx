import { useState, useRef, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { IconReceipt, IconUser, IconLoader2 } from '@tabler/icons-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { usePOS } from '@/hooks/usePOS';
import { useLoyalty } from '@/hooks/useLoyalty';
import { useAuth } from '@/hooks/useAuth';
import { useStore } from '@/hooks/useDatabase';
import { useProductsWithDetails } from '@/hooks/useProducts';
import { POSCart } from '@/components/pos/POSCart';
import { POSCheckout } from '@/components/pos/POSCheckout';
import { POSSearch } from '@/components/pos/POSSearch';
import { POSQuickAdd } from '@/components/pos/POSQuickAdd';
import { POSReceipt } from '@/components/pos/POSReceipt';
import { LoyaltyWidget } from '@/components/pos/LoyaltyWidget';
import { toast } from 'sonner';

export default function POSPage() {
  const { user } = useAuth();
  const { data: store, isLoading: storeLoading } = useStore(user?.id);
  const { data: products, isLoading: productsLoading } = useProductsWithDetails(store?.id);
  const receiptRef = useRef<HTMLDivElement>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [loyaltyDiscount, setLoyaltyDiscount] = useState(0);
  const [loyaltyPointsToRedeem, setLoyaltyPointsToRedeem] = useState(0);
  const [pointsToEarnPreview, setPointsToEarnPreview] = useState(0);
  const [lastSale, setLastSale] = useState<{
    orderNumber: string;
    items: any[];
    total: number;
    paymentMethod: string;
    loyaltyPointsEarned: number;
    loyaltyPointsRedeemed: number;
    loyaltyDiscount: number;
  } | null>(null);

  const {
    cart,
    discount,
    customerInfo,
    isProcessing,
    subtotal,
    discountAmount,
    taxAmount,
    total,
    TAX_RATE,
    addToCart,
    updateQuantity,
    removeFromCart,
    setDiscount,
    setCustomerInfo,
    completeSale,
    clearCart,
  } = usePOS();

  const { awardPoints } = useLoyalty(store?.id);

  // Transform products into quick add items (top 5 popular/recent)
  const quickProducts = useMemo(() => {
    if (!products) return [];
    
    return products
      .filter(p => p.is_active)
      .slice(0, 5)
      .map(product => ({
        id: product.id,
        productId: product.id,
        name: product.name.length > 20 ? product.name.slice(0, 20) + '...' : product.name,
        price: product.sale_price || product.base_price,
        emoji: '👗',
        sku: product.sku,
        image: product.images?.[0],
        variantId: product.variants?.[0]?.id,
      }));
  }, [products]);

  const handleAddToCart = useCallback((item: Parameters<typeof addToCart>[0]) => {
    addToCart(item);
    toast.success(`Added ${item.name} to cart`);
  }, [addToCart]);

  const handleQuickAdd = useCallback((product: typeof quickProducts[0]) => {
    addToCart({
      id: product.variantId ? `${product.id}-${product.variantId}` : product.id,
      productId: product.id,
      variantId: product.variantId,
      name: product.name,
      sku: product.sku,
      price: product.price,
      image: product.image,
    });
    toast.success(`Added ${product.name}`);
  }, [addToCart]);

  const handleCompleteSale = useCallback(async (method: 'cash' | 'card' | 'upi') => {
    if (!store?.id) {
      toast.error('Store not found');
      return;
    }

    // Apply loyalty discount to total
    const finalTotal = total - loyaltyDiscount;
    const result = await completeSale(method, store.id);
    
    if (result) {
      // Award loyalty points if customer phone provided
      let pointsEarned = 0;
      if (customerInfo.phone && customerInfo.phone.length >= 10) {
        try {
          const loyaltyResult = await awardPoints.mutateAsync({
            phone: customerInfo.phone,
            name: customerInfo.name || undefined,
            orderId: result.orderId,
            amount: finalTotal,
          });
          pointsEarned = loyaltyResult.pointsEarned;
        } catch (err) {
          console.error('Failed to award points:', err);
        }
      }

      setLastSale({
        orderNumber: result.orderNumber,
        items: result.items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
        })),
        total: finalTotal,
        paymentMethod: method,
        loyaltyPointsEarned: pointsEarned,
        loyaltyPointsRedeemed: loyaltyPointsToRedeem,
        loyaltyDiscount: loyaltyDiscount,
      });
      
      // Reset loyalty state
      setLoyaltyDiscount(0);
      setLoyaltyPointsToRedeem(0);
      setPointsToEarnPreview(0);
      
      setShowReceipt(true);
    }
  }, [store?.id, completeSale, total, loyaltyDiscount, customerInfo, awardPoints, loyaltyPointsToRedeem]);

  const handlePrintReceipt = useCallback(() => {
    if (!receiptRef.current) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow popups to print receipt');
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt</title>
          <style>
            body { font-family: monospace; padding: 20px; }
            * { margin: 0; padding: 0; box-sizing: border-box; }
          </style>
        </head>
        <body>
          ${receiptRef.current.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }, []);

  const handleCloseReceipt = useCallback(() => {
    setShowReceipt(false);
    setLoyaltyDiscount(0);
    setLoyaltyPointsToRedeem(0);
    clearCart();
  }, [clearCart]);

  const handleRewardSelect = useCallback((discount: number, pointsUsed: number) => {
    setLoyaltyDiscount(discount);
    setLoyaltyPointsToRedeem(pointsUsed);
  }, []);

  const isLoading = storeLoading || productsLoading;

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="text-center">
          <IconLoader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
          <p className="text-muted-foreground">Loading POS...</p>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Please set up your store first</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-[calc(100vh-8rem)]"
    >
      <div className="grid lg:grid-cols-3 gap-4 md:gap-6 h-full">
        {/* Left Panel - Products & Cart */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Search */}
          <POSSearch storeId={store.id} onAddToCart={handleAddToCart} />

          {/* Quick Products */}
          {quickProducts.length > 0 && (
            <POSQuickAdd products={quickProducts} onAdd={handleQuickAdd} />
          )}

          {/* Customer Info (Collapsible) */}
          <div className="bg-card rounded-xl border border-border p-3 md:p-4">
            <div className="flex items-center gap-2 mb-3">
              <IconUser className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Customer (Optional)</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="customerName" className="text-xs">Name</Label>
                <Input
                  id="customerName"
                  placeholder="Customer name"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                  className="h-9 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="customerPhone" className="text-xs">Phone</Label>
                <Input
                  id="customerPhone"
                  placeholder="Phone number"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                  className="h-9 text-sm"
                />
              </div>
            </div>

            {/* Loyalty Widget */}
            <LoyaltyWidget
              storeId={store.id}
              customerPhone={customerInfo.phone}
              orderTotal={total}
              onRewardSelect={handleRewardSelect}
              onPointsEarnedPreview={setPointsToEarnPreview}
            />
          </div>

          {/* Cart Items */}
          <div className="flex-1 bg-card rounded-2xl border border-border overflow-hidden flex flex-col">
            <div className="p-3 md:p-4 border-b border-border flex items-center justify-between">
              <h2 className="font-display text-base md:text-lg font-semibold text-foreground flex items-center gap-2">
                <IconReceipt className="w-5 h-5" />
                Current Order
              </h2>
              <span className="text-sm text-muted-foreground">
                {cart.length} item{cart.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="flex-1 p-3 md:p-4 overflow-y-auto custom-scrollbar">
              <POSCart
                items={cart}
                onUpdateQuantity={updateQuantity}
                onRemoveItem={removeFromCart}
              />
            </div>
          </div>
        </div>

        {/* Right Panel - Checkout */}
        <div className="flex flex-col">
          <POSCheckout
            subtotal={subtotal}
            discount={discount}
            discountAmount={discountAmount}
            taxRate={TAX_RATE}
            taxAmount={taxAmount}
            total={total}
            cartItemCount={cart.length}
            isProcessing={isProcessing}
            onDiscountChange={setDiscount}
            onCompleteSale={handleCompleteSale}
            onPrintReceipt={() => {
              if (lastSale) {
                setShowReceipt(true);
              } else {
                toast.info('Complete a sale first to print receipt');
              }
            }}
          />
        </div>
      </div>

      {/* Receipt Dialog */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Receipt</DialogTitle>
          </DialogHeader>
          
          {lastSale && (
            <>
              <POSReceipt
                ref={receiptRef}
                orderNumber={lastSale.orderNumber}
                storeName={store.brand_name || store.name}
                storeAddress={store.address || 'Address not set'}
                storeId={store.id}
                gstNumber={store.gst_number || 'GST not set'}
                items={lastSale.items}
                subtotal={subtotal}
                discount={discount}
                discountAmount={discountAmount}
                loyaltyDiscount={lastSale.loyaltyDiscount}
                loyaltyPointsEarned={lastSale.loyaltyPointsEarned}
                loyaltyPointsRedeemed={lastSale.loyaltyPointsRedeemed}
                taxRate={TAX_RATE}
                taxAmount={taxAmount}
                total={lastSale.total}
                paymentMethod={lastSale.paymentMethod}
                customerName={customerInfo.name}
                customerPhone={customerInfo.phone}
                date={new Date()}
              />
              
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handlePrintReceipt}
                  className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  Print Receipt
                </button>
                <button
                  onClick={handleCloseReceipt}
                  className="flex-1 py-2 bg-muted text-foreground rounded-lg font-medium hover:bg-muted/80 transition-colors"
                >
                  Close & Clear
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
