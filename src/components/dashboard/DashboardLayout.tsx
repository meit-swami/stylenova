import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IconSparkles, 
  IconLayoutDashboard, 
  IconPackage, 
  IconReceipt, 
  IconUsers, 
  IconChartBar,
  IconSettings,
  IconBuildingStore,
  IconLogout,
  IconMenu2,
  IconX,
  IconBell,
  IconSearch,
  IconDeviceTablet,
  IconHanger
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: IconLayoutDashboard },
  { name: 'Virtual Try-On', href: '/dashboard/try-on', icon: IconHanger },
  { name: 'Inventory', href: '/dashboard/inventory', icon: IconPackage },
  { name: 'POS & Billing', href: '/dashboard/pos', icon: IconReceipt },
  { name: 'Staff', href: '/dashboard/staff', icon: IconUsers },
  { name: 'Analytics', href: '/dashboard/analytics', icon: IconChartBar },
  { name: 'Store Profile', href: '/dashboard/store', icon: IconBuildingStore },
  { name: 'Settings', href: '/dashboard/settings', icon: IconSettings },
];

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 sidebar-gradient transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-sidebar-border">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
                <IconSparkles className="h-6 w-6 text-sidebar-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold text-sidebar-foreground">
                StyleNova ✨
              </span>
            </Link>
            <button
              className="lg:hidden p-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <IconX className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-glow'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Kiosk Mode Button */}
          <div className="p-4 border-t border-sidebar-border">
            <Link to="/kiosk">
              <Button variant="gold" className="w-full justify-start gap-3">
                <IconDeviceTablet className="w-5 h-5" />
                Switch to Kiosk Mode
              </Button>
            </Link>
          </div>

          {/* User Section */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-sidebar-accent">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-sidebar-primary-foreground font-semibold text-sm">JD</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">John Doe</p>
                <p className="text-xs text-sidebar-foreground/60 truncate">Store Admin</p>
              </div>
              <button className="p-2 rounded-lg text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-border transition-colors">
                <IconLogout className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border">
          <div className="flex items-center justify-between px-4 lg:px-8 h-16">
            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <IconMenu2 className="w-6 h-6" />
            </button>

            {/* Search */}
            <div className="hidden md:flex flex-1 max-w-md">
              <div className="relative w-full">
                <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search products, orders..."
                  className="pl-10 bg-muted/50 border-0 focus:bg-background"
                />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
                <IconBell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
              </button>
              <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-border">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <span className="text-primary-foreground font-semibold text-sm">JD</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
