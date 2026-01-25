import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  IconPlus, 
  IconMinus, 
  IconTrash, 
  IconSearch,
  IconReceipt,
  IconCash,
  IconCreditCard,
  IconQrcode,
  IconPrinter,
  IconDiscount
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const cartItems = [
  { id: 1, name: 'Silk Saree - Royal Blue', price: 4599, qty: 1, image: '🥻' },
  { id: 2, name: 'Gold Necklace - Temple', price: 24999, qty: 1, image: '📿' },
  { id: 3, name: 'Embroidered Kurti', price: 1299, qty: 2, image: '👚' },
];

const quickProducts = [
  { id: 101, name: 'Silk Dupatta', price: 899, image: '🧣' },
  { id: 102, name: 'Bangles Set', price: 499, image: '💍' },
  { id: 103, name: 'Clutch Bag', price: 1299, image: '👜' },
  { id: 104, name: 'Hair Clips', price: 199, image: '🎀' },
];

export default function POSPage() {
  const [cart, setCart] = useState(cartItems);
  const [discount, setDiscount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const discountAmount = (subtotal * discount) / 100;
  const tax = (subtotal - discountAmount) * 0.18; // 18% GST
  const total = subtotal - discountAmount + tax;

  const updateQty = (id: number, change: number) => {
    setCart(cart.map(item => 
      item.id === id 
        ? { ...item, qty: Math.max(1, item.qty + change) }
        : item
    ));
  };

  const removeItem = (id: number) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const addQuickProduct = (product: typeof quickProducts[0]) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      updateQty(product.id, 1);
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-[calc(100vh-8rem)]"
    >
      <div className="grid lg:grid-cols-3 gap-6 h-full">
        {/* Left Panel - Products */}
        <div className="lg:col-span-2 flex flex-col">
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Scan barcode or search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-lg"
              />
            </div>
          </div>

          {/* Quick Products */}
          <div className="mb-6">
            <h3 className="font-medium text-muted-foreground text-sm mb-3">Quick Add</h3>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {quickProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addQuickProduct(product)}
                  className="flex-shrink-0 w-28 p-3 bg-card rounded-xl border border-border hover:border-primary transition-colors text-center"
                >
                  <div className="text-2xl mb-1">{product.image}</div>
                  <p className="text-xs font-medium text-foreground truncate">{product.name}</p>
                  <p className="text-xs text-muted-foreground">₹{product.price}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 bg-card rounded-2xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="font-display text-lg font-semibold text-foreground">
                Current Order
              </h2>
            </div>
            
            <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <IconReceipt className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No items in cart</p>
                  <p className="text-sm">Scan barcode or search to add products</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-3 rounded-xl bg-muted/50"
                  >
                    <div className="text-3xl">{item.image}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{item.name}</p>
                      <p className="text-sm text-muted-foreground">₹{item.price.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQty(item.id, -1)}
                        className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-muted-foreground/20 transition-colors"
                      >
                        <IconMinus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-medium">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.id, 1)}
                        className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-muted-foreground/20 transition-colors"
                      >
                        <IconPlus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-right min-w-20">
                      <p className="font-semibold text-foreground">
                        ₹{(item.price * item.qty).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                    >
                      <IconTrash className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Checkout */}
        <div className="flex flex-col">
          <div className="bg-card rounded-2xl border border-border flex-1 flex flex-col">
            <div className="p-6 border-b border-border">
              <h2 className="font-display text-lg font-semibold text-foreground">
                Order Summary
              </h2>
            </div>

            <div className="p-6 flex-1">
              {/* Discount */}
              <div className="mb-6">
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Discount
                </label>
                <div className="flex gap-2">
                  {[0, 5, 10, 15].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDiscount(d)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                        discount === d
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted-foreground/20'
                      }`}
                    >
                      {d}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="space-y-3">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Discount ({discount}%)</span>
                    <span>-₹{discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>GST (18%)</span>
                  <span>₹{tax.toLocaleString()}</span>
                </div>
                <hr className="border-border" />
                <div className="flex justify-between text-xl font-bold text-foreground">
                  <span>Total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="p-6 border-t border-border space-y-3">
              <h3 className="font-medium text-muted-foreground text-sm mb-3">Payment Method</h3>
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" className="flex-col h-auto py-4">
                  <IconCash className="w-6 h-6 mb-1" />
                  <span className="text-xs">Cash</span>
                </Button>
                <Button variant="outline" className="flex-col h-auto py-4">
                  <IconCreditCard className="w-6 h-6 mb-1" />
                  <span className="text-xs">Card</span>
                </Button>
                <Button variant="outline" className="flex-col h-auto py-4">
                  <IconQrcode className="w-6 h-6 mb-1" />
                  <span className="text-xs">UPI</span>
                </Button>
              </div>
              
              <Button variant="hero" size="xl" className="w-full" disabled={cart.length === 0}>
                <IconReceipt className="w-5 h-5" />
                Complete Sale
              </Button>
              
              <Button variant="outline" className="w-full" disabled={cart.length === 0}>
                <IconPrinter className="w-4 h-4" />
                Print Receipt
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
