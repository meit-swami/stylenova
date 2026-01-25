import { motion } from 'framer-motion';
import { 
  IconShoppingBag, 
  IconUsers, 
  IconHanger, 
  IconCurrencyRupee,
  IconTrendingUp,
  IconTrendingDown,
  IconArrowUpRight,
  IconPackage,
  IconReceipt
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';

const stats = [
  {
    name: 'Total Revenue',
    value: '₹2,45,890',
    change: '+12.5%',
    trend: 'up',
    icon: IconCurrencyRupee,
    gradient: 'from-primary to-accent',
  },
  {
    name: 'Try-On Sessions',
    value: '1,234',
    change: '+8.2%',
    trend: 'up',
    icon: IconHanger,
    gradient: 'from-secondary to-amber-400',
  },
  {
    name: 'Wishlists Created',
    value: '456',
    change: '+23.1%',
    trend: 'up',
    icon: IconShoppingBag,
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    name: 'Active Products',
    value: '789',
    change: '-2.4%',
    trend: 'down',
    icon: IconPackage,
    gradient: 'from-rose-500 to-pink-500',
  },
];

const recentOrders = [
  { id: 'ORD-001', customer: 'Priya Sharma', amount: '₹4,599', status: 'completed', time: '2 min ago' },
  { id: 'ORD-002', customer: 'Rahul Verma', amount: '₹2,199', status: 'pending', time: '15 min ago' },
  { id: 'ORD-003', customer: 'Anita Singh', amount: '₹8,999', status: 'completed', time: '1 hour ago' },
  { id: 'ORD-004', customer: 'Vikram Patel', amount: '₹3,450', status: 'processing', time: '2 hours ago' },
];

const topProducts = [
  { name: 'Silk Saree - Royal Blue', tryOns: 156, conversions: 23, image: '🥻' },
  { name: 'Designer Lehenga Set', tryOns: 134, conversions: 18, image: '👗' },
  { name: 'Gold Necklace - Temple', tryOns: 98, conversions: 31, image: '📿' },
  { name: 'Embroidered Kurti', tryOns: 87, conversions: 15, image: '👚' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function DashboardHome() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            Welcome back, John! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your store today.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <IconReceipt className="w-4 h-4" />
            New Sale
          </Button>
          <Button variant="hero">
            <IconPackage className="w-4 h-4" />
            Add Product
          </Button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-card rounded-2xl border border-border p-6 card-hover"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${
                stat.trend === 'up' ? 'text-success' : 'text-destructive'
              }`}>
                {stat.trend === 'up' ? (
                  <IconTrendingUp className="w-4 h-4" />
                ) : (
                  <IconTrendingDown className="w-4 h-4" />
                )}
                {stat.change}
              </div>
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.name}</div>
          </div>
        ))}
      </motion.div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl font-semibold text-foreground">Recent Orders</h2>
            <Button variant="ghost" size="sm">
              View All
              <IconArrowUpRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <IconReceipt className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{order.customer}</p>
                    <p className="text-sm text-muted-foreground">{order.id} • {order.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">{order.amount}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    order.status === 'completed' ? 'bg-success/10 text-success' :
                    order.status === 'pending' ? 'bg-secondary/10 text-secondary' :
                    'bg-primary/10 text-primary'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Products */}
        <motion.div variants={itemVariants} className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl font-semibold text-foreground">Top Products</h2>
            <Button variant="ghost" size="sm">
              <IconArrowUpRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div
                key={product.name}
                className="flex items-center gap-4 p-3 rounded-xl bg-muted/50"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-muted to-background flex items-center justify-center text-2xl">
                  {product.image}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm truncate">{product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {product.tryOns} try-ons • {product.conversions} sales
                  </p>
                </div>
                <div className="text-xs font-medium text-primary">#{index + 1}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants} className="grid sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-primary to-accent rounded-2xl p-6 text-primary-foreground">
          <IconHanger className="w-8 h-8 mb-4" />
          <h3 className="font-display text-lg font-semibold mb-2">Virtual Try-On</h3>
          <p className="text-sm opacity-80 mb-4">Launch customer try-on mode on tablet</p>
          <Button variant="glass" size="sm">
            Launch Kiosk
          </Button>
        </div>
        <div className="bg-gradient-to-br from-secondary to-amber-400 rounded-2xl p-6 text-secondary-foreground">
          <IconPackage className="w-8 h-8 mb-4" />
          <h3 className="font-display text-lg font-semibold mb-2">Low Stock Alert</h3>
          <p className="text-sm opacity-80 mb-4">12 products need restocking</p>
          <Button variant="glass" size="sm">
            View Items
          </Button>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-6 text-primary-foreground">
          <IconUsers className="w-8 h-8 mb-4" />
          <h3 className="font-display text-lg font-semibold mb-2">Staff Online</h3>
          <p className="text-sm opacity-80 mb-4">3 staff members active now</p>
          <Button variant="glass" size="sm">
            Manage Staff
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
