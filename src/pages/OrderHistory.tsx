import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { IconReceipt, IconLoader2, IconGift, IconStar, IconShoppingBag } from '@tabler/icons-react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface OrderItem {
  id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  products: { name: string } | null;
}

interface Order {
  id: string;
  order_number: string;
  created_at: string;
  total: number;
  payment_method: string;
  loyalty_points_earned: number;
  order_items: OrderItem[];
}

interface LoyaltyAccount {
  id: string;
  customer_name: string | null;
  total_points: number;
  lifetime_points: number;
  tier: string;
}

interface Store {
  id: string;
  name: string;
  brand_name: string | null;
  logo_url: string | null;
}

export default function OrderHistory() {
  const [searchParams] = useSearchParams();
  const phone = searchParams.get('phone');
  const storeId = searchParams.get('store');
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loyalty, setLoyalty] = useState<LoyaltyAccount | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!phone || !storeId) {
        setError('Invalid link. Please scan a valid QR code.');
        setLoading(false);
        return;
      }

      try {
        // Fetch store info
        const { data: storeData } = await supabase
          .from('stores')
          .select('id, name, brand_name, logo_url')
          .eq('id', storeId)
          .single();
        
        if (storeData) setStore(storeData);

        // Fetch orders for this phone number
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select(`
            id,
            order_number,
            created_at,
            total,
            payment_method,
            loyalty_points_earned,
            order_items (
              id,
              quantity,
              unit_price,
              total_price,
              products (name)
            )
          `)
          .eq('store_id', storeId)
          .eq('customer_phone', phone)
          .order('created_at', { ascending: false })
          .limit(20);

        if (ordersError) throw ordersError;
        setOrders(ordersData || []);

        // Fetch loyalty account
        const { data: loyaltyData } = await supabase
          .from('loyalty_accounts')
          .select('id, customer_name, total_points, lifetime_points, tier')
          .eq('store_id', storeId)
          .eq('customer_phone', phone)
          .single();

        if (loyaltyData) setLoyalty(loyaltyData);
      } catch (err: any) {
        console.error('Error fetching order history:', err);
        setError('Failed to load your purchase history.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [phone, storeId]);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'platinum': return 'bg-gradient-to-r from-slate-400 to-slate-600 text-white';
      case 'gold': return 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white';
      case 'silver': return 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800';
      default: return 'bg-gradient-to-r from-orange-600 to-orange-700 text-white';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <IconLoader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
          <p className="text-muted-foreground">Loading your purchase history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-8">
            <IconReceipt className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalSpent = orders.reduce((sum, order) => sum + Number(order.total), 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-6 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            {store?.logo_url ? (
              <img src={store.logo_url} alt={store.name} className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <IconShoppingBag className="w-6 h-6" />
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold">{store?.brand_name || store?.name || 'Store'}</h1>
              <p className="text-sm opacity-80">Your Purchase History</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Loyalty Card */}
        {loyalty && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="overflow-hidden">
              <div className={`p-4 ${getTierColor(loyalty.tier)}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-80">Loyalty Program</p>
                    <p className="text-2xl font-bold capitalize">{loyalty.tier} Member</p>
                  </div>
                  <IconStar className="w-10 h-10 opacity-60" />
                </div>
              </div>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <IconGift className="w-6 h-6 mx-auto mb-1 text-primary" />
                    <p className="text-2xl font-bold text-primary">{loyalty.total_points}</p>
                    <p className="text-xs text-muted-foreground">Available Points</p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <IconStar className="w-6 h-6 mx-auto mb-1 text-amber-500" />
                    <p className="text-2xl font-bold">{loyalty.lifetime_points}</p>
                    <p className="text-xs text-muted-foreground">Lifetime Points</p>
                  </div>
                </div>
                {loyalty.customer_name && (
                  <p className="mt-3 text-sm text-muted-foreground text-center">
                    Welcome, {loyalty.customer_name}!
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-primary">{orders.length}</p>
              <p className="text-sm text-muted-foreground">Total Orders</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">₹{totalSpent.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Spent</p>
            </CardContent>
          </Card>
        </div>

        {/* Orders List */}
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <IconReceipt className="w-5 h-5" />
            Recent Orders
          </h2>
          
          {orders.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <IconShoppingBag className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">No orders found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {orders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">
                          Order #{order.order_number}
                        </CardTitle>
                        <Badge variant="outline" className="text-xs">
                          {order.payment_method?.toUpperCase() || 'N/A'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(order.created_at), 'dd MMM yyyy, hh:mm a')}
                      </p>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-1 text-sm">
                        {order.order_items?.map((item) => (
                          <div key={item.id} className="flex justify-between text-muted-foreground">
                            <span>{item.products?.name || 'Item'} x{item.quantity}</span>
                            <span>₹{Number(item.total_price).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between items-center mt-3 pt-2 border-t">
                        <span className="font-semibold">Total</span>
                        <span className="font-bold text-lg">₹{Number(order.total).toLocaleString()}</span>
                      </div>
                      {order.loyalty_points_earned > 0 && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
                          <IconGift className="w-4 h-4" />
                          +{order.loyalty_points_earned} points earned
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-6 text-xs text-muted-foreground">
        <p>Powered by StyleNova ✨</p>
      </div>
    </div>
  );
}
