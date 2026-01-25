import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  IconChartBar,
  IconHanger,
  IconCurrencyRupee,
  IconTrendingUp,
  IconTrendingDown,
  IconArrowUpRight,
  IconLoader2,
  IconCalendar
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { 
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
import { useAuth } from '@/hooks/useAuth';
import { useStore } from '@/hooks/useDatabase';
import { useSalesAnalytics } from '@/hooks/useSalesAnalytics';

type TimeRange = 7 | 30 | 90;

export default function AnalyticsPage() {
  const { user } = useAuth();
  const { data: store } = useStore(user?.id);
  const [timeRange, setTimeRange] = useState<TimeRange>(30);
  const { data: analytics, isLoading } = useSalesAnalytics(store?.id, timeRange);

  const stats = [
    { 
      name: 'Total Revenue', 
      value: `₹${(analytics?.stats.totalRevenue || 0).toLocaleString()}`, 
      change: '+18.2%', 
      trend: 'up' as const, 
      icon: IconCurrencyRupee 
    },
    { 
      name: 'Total Orders', 
      value: (analytics?.stats.totalOrders || 0).toLocaleString(), 
      change: '+24.5%', 
      trend: 'up' as const, 
      icon: IconHanger 
    },
    { 
      name: 'Conversion Rate', 
      value: `${(analytics?.stats.conversionRate || 0).toFixed(1)}%`, 
      change: '+2.3%', 
      trend: 'up' as const, 
      icon: IconTrendingUp 
    },
    { 
      name: 'Avg. Order Value', 
      value: `₹${(analytics?.stats.avgOrderValue || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, 
      change: '-5.1%', 
      trend: 'down' as const, 
      icon: IconChartBar 
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <IconLoader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const chartData = timeRange === 7 
    ? analytics?.dailyRevenue.slice(-7) 
    : timeRange === 30 
      ? analytics?.dailyRevenue.slice(-30)
      : analytics?.weeklyRevenue;

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
        <div className="flex gap-2">
          <Button 
            variant={timeRange === 7 ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange(7)}
          >
            <IconCalendar className="w-4 h-4 mr-1" />
            7 Days
          </Button>
          <Button 
            variant={timeRange === 30 ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange(30)}
          >
            30 Days
          </Button>
          <Button 
            variant={timeRange === 90 ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange(90)}
          >
            90 Days
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
            {chartData && chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey={timeRange === 90 ? "week" : "date"} 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12} 
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12} 
                    tickFormatter={(value) => `₹${value >= 1000 ? `${(value/1000).toFixed(0)}k` : value}`} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--foreground))'
                    }}
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2} 
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <p>No revenue data available. Complete some sales to see trends.</p>
              </div>
            )}
          </div>
        </div>

        {/* Orders Chart */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-lg font-semibold text-foreground">Orders</h2>
            <Button variant="ghost" size="sm">
              <IconArrowUpRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="h-72">
            {chartData && chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey={timeRange === 90 ? "week" : "date"} 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12} 
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--foreground))'
                    }}
                  />
                  <Bar dataKey="orders" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <p>No order data available. Complete some sales to see trends.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Category Breakdown */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h2 className="font-display text-lg font-semibold text-foreground mb-6">Sales by Category</h2>
          <div className="h-64">
            {analytics?.categoryBreakdown && analytics.categoryBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {analytics.categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-center">
                <p>No category data yet.<br />Sales will appear here.</p>
              </div>
            )}
          </div>
          {analytics?.categoryBreakdown && analytics.categoryBreakdown.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mt-4">
              {analytics.categoryBreakdown.slice(0, 6).map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-muted-foreground truncate">{item.name} ({item.value}%)</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-lg font-semibold text-foreground">Top Selling Products</h2>
            <Button variant="ghost" size="sm">
              View All
              <IconArrowUpRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="overflow-x-auto">
            {analytics?.topProducts && analytics.topProducts.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left pb-3 font-medium text-muted-foreground">Product</th>
                    <th className="text-right pb-3 font-medium text-muted-foreground">Qty Sold</th>
                    <th className="text-right pb-3 font-medium text-muted-foreground">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.topProducts.slice(0, 5).map((product, index) => (
                    <tr key={product.name} className="border-b border-border last:border-0">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-primary">#{index + 1}</span>
                          <span className="font-medium text-foreground truncate max-w-[200px]">{product.name}</span>
                        </div>
                      </td>
                      <td className="py-3 text-right text-muted-foreground">{product.quantity}</td>
                      <td className="py-3 text-right font-medium text-foreground">₹{product.revenue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-12 text-center text-muted-foreground">
                <p>No sales data yet. Complete some sales to see top products.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
