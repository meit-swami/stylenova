import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { IconReceipt, IconUser } from '@tabler/icons-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { usePOS } from '@/hooks/usePOS';
import { useAuth } from '@/hooks/useAuth';
import { POSCart } from '@/components/pos/POSCart';
import { POSCheckout } from '@/components/pos/POSCheckout';
import { POSSearch } from '@/components/pos/POSSearch';
import { POSQuickAdd } from '@/components/pos/POSQuickAdd';
import { POSReceipt } from '@/components/pos/POSReceipt';
import { toast } from 'sonner';

// Quick add sample products
const quickProducts = [
  { id: 'q1', name: 'Silk Dupatta', price: 899, emoji: '🧣' },
  { id: 'q2', name: 'Bangles Set', price: 499, emoji: '💍' },
  { id: 'q3', name: 'Clutch Bag', price: 1299, emoji: '👜' },
  { id: 'q4', name: 'Hair Clips', price: 199, emoji: '🎀' },
  { id: 'q5', name: 'Earrings', price: 349, emoji: '✨' },
];

export default function POSPage() {
  const { user } = useAuth();
  const receiptRef = useRef<HTMLDivElement>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSale, setLastSale] = useState<{
    orderNumber: string;
    items: any[];
    total: number;
    paymentMethod: string;
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
  } = usePOS();

  // Demo store ID - in production this would come from user's store
  const storeId = 'demo-store-id';

  const handleAddToCart = useCallback((item: Parameters<typeof addToCart>[0]) => {
    addToCart(item);
    toast.success(`Added ${item.name} to cart`);
  }, [addToCart]);

  const handleQuickAdd = useCallback((product: typeof quickProducts[0]) => {
    addToCart({
      id: product.id,
      productId: product.id,
      name: product.name,
      sku: `QA-${product.id}`,
      price: product.price,
    });
    toast.success(`Added ${product.name}`);
  }, [addToCart]);

  const handleCompleteSale = useCallback(async (method: 'cash' | 'card' | 'upi') => {
    // For demo, simulate the sale without database
    const orderNumber = `ORD-${Date.now().toString().slice(-8)}`;
    
    setLastSale({
      orderNumber,
      items: cart.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
      })),
      total,
      paymentMethod: method,
    });

    toast.success(`Sale completed! Order: ${orderNumber}`);
    setShowReceipt(true);
    
    // Clear cart after showing receipt
    // In production, use: await completeSale(method, storeId);
  }, [cart, total]);

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
          <POSSearch storeId={storeId} onAddToCart={handleAddToCart} />

          {/* Quick Products */}
          <POSQuickAdd products={quickProducts} onAdd={handleQuickAdd} />

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
                storeName="StyleNova ✨"
                storeAddress="Fashion District, Mumbai"
                gstNumber="27AABCU9603R1ZM"
                items={lastSale.items}
                subtotal={subtotal}
                discount={discount}
                discountAmount={discountAmount}
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
                  onClick={() => setShowReceipt(false)}
                  className="flex-1 py-2 bg-muted text-foreground rounded-lg font-medium hover:bg-muted/80 transition-colors"
                >
                  Close
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
