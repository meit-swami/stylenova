import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import KioskMode from "./pages/KioskMode";
import PublicWishlist from "./pages/PublicWishlist";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import DashboardHome from "./pages/dashboard/DashboardHome";
import InventoryPage from "./pages/dashboard/InventoryPage";
import TryOnPage from "./pages/dashboard/TryOnPage";
import POSPage from "./pages/dashboard/POSPage";
import StaffPage from "./pages/dashboard/StaffPage";
import AnalyticsPage from "./pages/dashboard/AnalyticsPage";
import StoreProfilePage from "./pages/dashboard/StoreProfilePage";
import SettingsPage from "./pages/dashboard/SettingsPage";
import SuperadminDashboard from "./pages/dashboard/SuperadminDashboard";
import OrderHistory from "./pages/OrderHistory";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/wishlist/:wishlistId" element={<PublicWishlist />} />
            <Route path="/order-history" element={<OrderHistory />} />
            
            {/* Protected Routes */}
            <Route path="/kiosk" element={
              <ProtectedRoute>
                <KioskMode />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<DashboardHome />} />
              <Route path="inventory" element={<InventoryPage />} />
              <Route path="try-on" element={<TryOnPage />} />
              <Route path="pos" element={<POSPage />} />
              <Route path="staff" element={<StaffPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="store" element={<StoreProfilePage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="superadmin" element={<SuperadminDashboard />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
