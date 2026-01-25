import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfDay, startOfWeek, startOfMonth, subDays, format } from 'date-fns';

interface AnalyticsData {
  dailyRevenue: { date: string; revenue: number; orders: number }[];
  weeklyRevenue: { week: string; revenue: number; orders: number }[];
  monthlyRevenue: { month: string; revenue: number; orders: number }[];
  topProducts: { name: string; quantity: number; revenue: number }[];
  categoryBreakdown: { name: string; value: number; color: string }[];
  stats: {
    totalRevenue: number;
    totalOrders: number;
    avgOrderValue: number;
    conversionRate: number;
  };
  recentOrders: any[];
}

const CATEGORY_COLORS = [
  '#6366f1', // primary
  '#f59e0b', // amber
  '#10b981', // emerald
  '#ec4899', // pink
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#f97316', // orange
];

export function useSalesAnalytics(storeId: string | undefined, days: number = 30) {
  return useQuery({
    queryKey: ['sales-analytics', storeId, days],
    queryFn: async (): Promise<AnalyticsData> => {
      if (!storeId) {
        return getEmptyAnalytics();
      }

      const startDate = subDays(new Date(), days);

      // Fetch orders with items
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(
            *,
            products(name, category_id, product_categories(name))
          )
        `)
        .eq('store_id', storeId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (ordersError) throw ordersError;

      // Fetch try-on sessions for conversion rate
      const { data: sessions, error: sessionsError } = await supabase
        .from('tryon_sessions')
        .select('id')
        .eq('store_id', storeId)
        .gte('created_at', startDate.toISOString());

      if (sessionsError) throw sessionsError;

      // Calculate daily revenue
      const dailyMap = new Map<string, { revenue: number; orders: number }>();
      const productMap = new Map<string, { quantity: number; revenue: number }>();
      const categoryMap = new Map<string, number>();

      let totalRevenue = 0;
      let totalOrders = orders?.length || 0;

      orders?.forEach((order) => {
        const dateKey = format(new Date(order.created_at), 'yyyy-MM-dd');
        const existing = dailyMap.get(dateKey) || { revenue: 0, orders: 0 };
        dailyMap.set(dateKey, {
          revenue: existing.revenue + Number(order.total),
          orders: existing.orders + 1,
        });

        totalRevenue += Number(order.total);

        // Product breakdown
        order.order_items?.forEach((item: any) => {
          const productName = item.products?.name || 'Unknown';
          const existing = productMap.get(productName) || { quantity: 0, revenue: 0 };
          productMap.set(productName, {
            quantity: existing.quantity + item.quantity,
            revenue: existing.revenue + Number(item.total_price),
          });

          // Category breakdown
          const categoryName = item.products?.product_categories?.name || 'Other';
          categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + Number(item.total_price));
        });
      });

      // Generate daily revenue for last N days
      const dailyRevenue: AnalyticsData['dailyRevenue'] = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const dateKey = format(date, 'yyyy-MM-dd');
        const data = dailyMap.get(dateKey) || { revenue: 0, orders: 0 };
        dailyRevenue.push({
          date: format(date, 'MMM dd'),
          ...data,
        });
      }

      // Weekly aggregation (last 12 weeks)
      const weeklyRevenue: AnalyticsData['weeklyRevenue'] = [];
      for (let i = 11; i >= 0; i--) {
        const weekStart = startOfWeek(subDays(new Date(), i * 7));
        let weekRevenue = 0;
        let weekOrders = 0;

        for (let d = 0; d < 7; d++) {
          const date = format(subDays(new Date(), i * 7 - d), 'yyyy-MM-dd');
          const data = dailyMap.get(date);
          if (data) {
            weekRevenue += data.revenue;
            weekOrders += data.orders;
          }
        }

        weeklyRevenue.push({
          week: `Week ${12 - i}`,
          revenue: weekRevenue,
          orders: weekOrders,
        });
      }

      // Monthly aggregation (last 6 months)
      const monthlyRevenue: AnalyticsData['monthlyRevenue'] = [];
      for (let i = 5; i >= 0; i--) {
        const monthStart = startOfMonth(subDays(new Date(), i * 30));
        const monthKey = format(monthStart, 'MMM yyyy');
        let monthRevenue = 0;
        let monthOrders = 0;

        dailyMap.forEach((data, dateKey) => {
          if (format(new Date(dateKey), 'MMM yyyy') === monthKey) {
            monthRevenue += data.revenue;
            monthOrders += data.orders;
          }
        });

        monthlyRevenue.push({
          month: format(monthStart, 'MMM'),
          revenue: monthRevenue,
          orders: monthOrders,
        });
      }

      // Top products
      const topProducts = Array.from(productMap.entries())
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      // Category breakdown
      const totalCategoryRevenue = Array.from(categoryMap.values()).reduce((a, b) => a + b, 0);
      const categoryBreakdown = Array.from(categoryMap.entries())
        .map(([name, value], index) => ({
          name,
          value: totalCategoryRevenue > 0 ? Math.round((value / totalCategoryRevenue) * 100) : 0,
          color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
        }))
        .sort((a, b) => b.value - a.value);

      // Stats
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      const conversionRate = sessions && sessions.length > 0 
        ? (totalOrders / sessions.length) * 100 
        : 0;

      return {
        dailyRevenue,
        weeklyRevenue,
        monthlyRevenue,
        topProducts,
        categoryBreakdown,
        stats: {
          totalRevenue,
          totalOrders,
          avgOrderValue,
          conversionRate,
        },
        recentOrders: orders?.slice(-10).reverse() || [],
      };
    },
    enabled: !!storeId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

function getEmptyAnalytics(): AnalyticsData {
  return {
    dailyRevenue: [],
    weeklyRevenue: [],
    monthlyRevenue: [],
    topProducts: [],
    categoryBreakdown: [],
    stats: {
      totalRevenue: 0,
      totalOrders: 0,
      avgOrderValue: 0,
      conversionRate: 0,
    },
    recentOrders: [],
  };
}
