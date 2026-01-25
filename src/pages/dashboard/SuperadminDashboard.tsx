import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  IconBuildingStore,
  IconUsers,
  IconDeviceTablet,
  IconCurrencyRupee,
  IconTrendingUp,
  IconAlertTriangle,
  IconCheck,
  IconX,
  IconSearch,
  IconFilter,
  IconEye,
  IconMail
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const stats = [
  { name: 'Total Stores', value: '532', change: '+12', icon: IconBuildingStore, gradient: 'from-primary to-accent' },
  { name: 'Active Subscriptions', value: '487', change: '+8', icon: IconCurrencyRupee, gradient: 'from-secondary to-amber-400' },
  { name: 'Monthly Revenue', value: '₹32.5L', change: '+18%', icon: IconTrendingUp, gradient: 'from-emerald-500 to-teal-500' },
  { name: 'Pending Requests', value: '24', change: '-5', icon: IconDeviceTablet, gradient: 'from-rose-500 to-pink-500' },
];

const stores = [
  { id: 1, name: 'Sharma Fashion House', owner: 'Raj Sharma', plan: 'Large', status: 'active', revenue: '₹2.4L', tablets: 3 },
  { id: 2, name: 'Priya Boutique', owner: 'Priya Singh', plan: 'Medium', status: 'active', revenue: '₹1.8L', tablets: 2 },
  { id: 3, name: 'Ethnic Wear Hub', owner: 'Ankit Verma', plan: 'Small', status: 'pending', revenue: '-', tablets: 1 },
  { id: 4, name: 'Royal Jewellers', owner: 'Suresh Mehta', plan: 'Large', status: 'active', revenue: '₹5.2L', tablets: 4 },
  { id: 5, name: 'Modern Styles', owner: 'Neha Kapoor', plan: 'Medium', status: 'expired', revenue: '₹89K', tablets: 2 },
];

const tabletRequests = [
  { id: 1, store: 'Sharma Fashion House', count: 2, reason: 'Expanding to new floor', status: 'pending', date: '2024-01-15' },
  { id: 2, store: 'Priya Boutique', count: 1, reason: 'Replacement for damaged unit', status: 'approved', date: '2024-01-14' },
  { id: 3, store: 'Royal Jewellers', count: 3, reason: 'Opening new showroom', status: 'pending', date: '2024-01-13' },
];

export default function SuperadminDashboard() {
  const [activeTab, setActiveTab] = useState<'stores' | 'requests'>('stores');
  const [searchQuery, setSearchQuery] = useState('');

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
            Superadmin Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage all stores, subscriptions, and platform settings
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <IconMail className="w-4 h-4" />
            Send Broadcast
          </Button>
          <Button variant="hero">
            <IconBuildingStore className="w-4 h-4" />
            Add Store
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-card rounded-2xl border border-border p-6 card-hover">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-sm font-medium text-success">{stat.change}</span>
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.name}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-border">
        <button
          onClick={() => setActiveTab('stores')}
          className={`pb-4 px-2 font-medium transition-colors relative ${
            activeTab === 'stores' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Store Management
          {activeTab === 'stores' && (
            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`pb-4 px-2 font-medium transition-colors relative flex items-center gap-2 ${
            activeTab === 'requests' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Tablet Requests
          <span className="text-xs px-2 py-0.5 rounded-full bg-destructive text-destructive-foreground">
            {tabletRequests.filter(r => r.status === 'pending').length}
          </span>
          {activeTab === 'requests' && (
            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
      </div>

      {activeTab === 'stores' && (
        <>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search stores..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-full sm:w-48">
                <IconFilter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stores Table */}
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left p-4 font-medium text-muted-foreground">Store</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Owner</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Plan</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Revenue</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Tablets</th>
                    <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stores.map((store) => (
                    <tr key={store.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                            <IconBuildingStore className="w-5 h-5 text-primary" />
                          </div>
                          <span className="font-medium text-foreground">{store.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground">{store.owner}</td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          store.plan === 'Large' ? 'bg-secondary/10 text-secondary' :
                          store.plan === 'Medium' ? 'bg-primary/10 text-primary' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {store.plan}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          store.status === 'active' ? 'bg-success/10 text-success' :
                          store.status === 'pending' ? 'bg-secondary/10 text-secondary' :
                          'bg-destructive/10 text-destructive'
                        }`}>
                          {store.status}
                        </span>
                      </td>
                      <td className="p-4 font-medium text-foreground">{store.revenue}</td>
                      <td className="p-4 text-foreground">{store.tablets}</td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <IconEye className="w-4 h-4" />
                          </Button>
                          {store.status === 'pending' && (
                            <>
                              <Button variant="ghost" size="sm" className="text-success hover:text-success">
                                <IconCheck className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                <IconX className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'requests' && (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left p-4 font-medium text-muted-foreground">Store</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Tablets Requested</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Reason</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Date</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tabletRequests.map((request) => (
                  <tr key={request.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-medium text-foreground">{request.store}</td>
                    <td className="p-4 text-foreground">{request.count}</td>
                    <td className="p-4 text-muted-foreground">{request.reason}</td>
                    <td className="p-4 text-muted-foreground">{request.date}</td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        request.status === 'approved' ? 'bg-success/10 text-success' :
                        'bg-secondary/10 text-secondary'
                      }`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="p-4">
                      {request.status === 'pending' && (
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" className="text-success hover:text-success">
                            <IconCheck className="w-4 h-4" />
                            Approve
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                            <IconX className="w-4 h-4" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
}
