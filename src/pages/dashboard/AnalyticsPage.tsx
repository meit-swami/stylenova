import { motion } from 'framer-motion';
import { 
  IconChartBar,
  IconUsers,
  IconHanger,
  IconCurrencyRupee,
  IconTrendingUp,
  IconTrendingDown,
  IconArrowUpRight
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const revenueData = [
  { name: 'Jan', revenue: 45000, tryons: 120 },
  { name: 'Feb', revenue: 52000, tryons: 145 },
  { name: 'Mar', revenue: 48000, tryons: 132 },
  { name: 'Apr', revenue: 61000, tryons: 178 },
  { name: 'May', revenue: 55000, tryons: 156 },
  { name: 'Jun', revenue: 67000, tryons: 189 },
  { name: 'Jul', revenue: 72000, tryons: 210 },
];

const categoryData = [
  { name: 'Sarees', value: 35, color: '#6366f1' },
  { name: 'Lehengas', value: 25, color: '#f59e0b' },
  { name: 'Kurtis', value: 20, color: '#10b981' },
  { name: 'Jewellery', value: 15, color: '#ec4899' },
  { name: 'Others', value: 5, color: '#8b5cf6' },
];

const topProducts = [
  { name: 'Silk Saree - Royal Blue', tryons: 156, conversions: 23, revenue: '₹1,05,777' },
  { name: 'Designer Lehenga Set', tryons: 134, conversions: 18, revenue: '₹2,33,982' },
  { name: 'Gold Necklace - Temple', tryons: 98, conversions: 31, revenue: '₹7,74,969' },
  { name: 'Embroidered Kurti', tryons: 87, conversions: 15, revenue: '₹19,485' },
  { name: 'Bridal Lehenga', tryons: 76, conversions: 12, revenue: '₹3,59,988' },
];

const stats = [
  { name: 'Total Revenue', value: '₹4,00,201', change: '+18.2%', trend: 'up', icon: IconCurrencyRupee },
  { name: 'Try-On Sessions', value: '1,130', change: '+24.5%', trend: 'up', icon: IconHanger },
  { name: 'Conversion Rate', value: '12.8%', change: '+2.3%', trend: 'up', icon: IconTrendingUp },
  { name: 'Avg. Order Value', value: '₹4,250', change: '-5.1%', trend: 'down', icon: IconChartBar },
];

export default function AnalyticsPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your store performance and insights
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            Last 7 Days
          </Button>
          <Button variant="outline">
            Export Report
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-card rounded-2xl border border-border p-6 card-hover">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-primary" />
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
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-lg font-semibold text-foreground">Revenue Trend</h2>
            <Button variant="ghost" size="sm">
              <IconArrowUpRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(value) => `₹${value/1000}k`} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Try-On Sessions Chart */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-lg font-semibold text-foreground">Try-On Sessions</h2>
            <Button variant="ghost" size="sm">
              <IconArrowUpRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="tryons" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Category Breakdown */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h2 className="font-display text-lg font-semibold text-foreground mb-6">Sales by Category</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {categoryData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-muted-foreground">{item.name} ({item.value}%)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-lg font-semibold text-foreground">Top Performing Products</h2>
            <Button variant="ghost" size="sm">
              View All
              <IconArrowUpRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left pb-3 font-medium text-muted-foreground">Product</th>
                  <th className="text-right pb-3 font-medium text-muted-foreground">Try-Ons</th>
                  <th className="text-right pb-3 font-medium text-muted-foreground">Conversions</th>
                  <th className="text-right pb-3 font-medium text-muted-foreground">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((product, index) => (
                  <tr key={product.name} className="border-b border-border last:border-0">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-primary">#{index + 1}</span>
                        <span className="font-medium text-foreground">{product.name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-right text-muted-foreground">{product.tryons}</td>
                    <td className="py-3 text-right text-muted-foreground">{product.conversions}</td>
                    <td className="py-3 text-right font-medium text-foreground">{product.revenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
