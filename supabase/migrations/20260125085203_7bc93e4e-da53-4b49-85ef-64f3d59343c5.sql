-- Create enums for the application
CREATE TYPE public.user_role AS ENUM ('superadmin', 'store_owner', 'store_admin', 'product_staff', 'inventory_manager', 'finance_manager', 'pos_cashier');
CREATE TYPE public.store_category AS ENUM ('small', 'medium', 'large');
CREATE TYPE public.subscription_status AS ENUM ('active', 'expired', 'pending', 'cancelled');
CREATE TYPE public.payment_type AS ENUM ('monthly', 'yearly');
CREATE TYPE public.tablet_request_status AS ENUM ('pending', 'approved', 'rejected', 'delivered');
CREATE TYPE public.order_status AS ENUM ('pending', 'processing', 'completed', 'cancelled');

-- Profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role user_role NOT NULL DEFAULT 'store_owner',
  store_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role, store_id)
);

-- Stores table
CREATE TABLE public.stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  brand_name TEXT,
  logo_url TEXT,
  address TEXT,
  gps_lat DECIMAL(10, 8),
  gps_long DECIMAL(11, 8),
  photos TEXT[] DEFAULT '{}',
  owner_name TEXT,
  owner_photo_url TEXT,
  gst_number TEXT,
  uin TEXT,
  brn TEXT,
  category store_category DEFAULT 'small',
  status TEXT DEFAULT 'pending',
  show_pricing BOOLEAN DEFAULT true,
  enable_wishlist BOOLEAN DEFAULT true,
  enable_sharing BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Update user_roles to reference stores
ALTER TABLE public.user_roles ADD CONSTRAINT fk_user_roles_store FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE;

-- Subscription plans
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category store_category NOT NULL UNIQUE,
  monthly_price DECIMAL(10, 2) NOT NULL,
  yearly_price DECIMAL(10, 2) NOT NULL,
  tablet_price DECIMAL(10, 2) NOT NULL DEFAULT 7000,
  tablet_value DECIMAL(10, 2) NOT NULL DEFAULT 15000,
  max_products INTEGER,
  max_staff INTEGER,
  features JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default plans
INSERT INTO public.subscription_plans (name, category, monthly_price, yearly_price, features) VALUES
('Small', 'small', 1500, 15000, '["Virtual Try-On (Basic)", "Inventory Management", "POS & Billing", "Up to 500 Products", "1 Staff Account", "Basic Analytics", "Email Support"]'),
('Medium', 'medium', 1833, 18500, '["Virtual Try-On (Advanced)", "Inventory Management", "POS & Billing", "Up to 2000 Products", "5 Staff Accounts", "Advanced Analytics", "AI Voice Assistant", "Wishlist & QR Sharing", "Priority Support"]'),
('Large', 'large', 2500, 25500, '["Virtual Try-On (Premium)", "Inventory Management", "POS & Billing", "Unlimited Products", "Unlimited Staff Accounts", "Full Analytics Suite", "AI Voice Assistant (Multi-lang)", "Wishlist & QR Sharing", "360° View Feature", "Multi-Tablet Support", "Dedicated Account Manager", "Custom Integrations"]');

-- Subscriptions
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES public.subscription_plans(id) NOT NULL,
  payment_type payment_type NOT NULL DEFAULT 'yearly',
  status subscription_status NOT NULL DEFAULT 'pending',
  amount_paid DECIMAL(10, 2),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Product categories
CREATE TABLE public.product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES public.product_categories(id),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(store_id, slug)
);

-- Products
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.product_categories(id),
  name TEXT NOT NULL,
  description TEXT,
  base_price DECIMAL(10, 2) NOT NULL,
  sale_price DECIMAL(10, 2),
  sku TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  enable_tryon BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(store_id, sku)
);

-- Product variants (size, color combinations)
CREATE TABLE public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  size TEXT,
  color TEXT,
  sku TEXT NOT NULL,
  price_adjustment DECIMAL(10, 2) DEFAULT 0,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 5,
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(product_id, size, color)
);

-- Inventory stock movements
CREATE TABLE public.inventory_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE NOT NULL,
  quantity_change INTEGER NOT NULL,
  movement_type TEXT NOT NULL, -- 'in', 'out', 'adjustment', 'sale'
  reference_id UUID, -- order_id or adjustment_id
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Try-on sessions
CREATE TABLE public.tryon_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
  customer_name TEXT,
  customer_phone TEXT,
  detected_skin_tone TEXT,
  detected_body_type TEXT,
  detected_height TEXT,
  favorite_colors TEXT[] DEFAULT '{}',
  captured_images TEXT[] DEFAULT '{}',
  session_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Try-on results
CREATE TABLE public.tryon_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.tryon_sessions(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  variant_id UUID REFERENCES public.product_variants(id),
  result_image_url TEXT,
  match_score INTEGER,
  ai_comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Wishlists
CREATE TABLE public.wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.tryon_sessions(id) ON DELETE CASCADE NOT NULL,
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  share_url TEXT,
  qr_code_url TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Wishlist items
CREATE TABLE public.wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wishlist_id UUID REFERENCES public.wishlists(id) ON DELETE CASCADE NOT NULL,
  tryon_result_id UUID REFERENCES public.tryon_results(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Orders/Sales
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
  order_number TEXT NOT NULL,
  customer_name TEXT,
  customer_phone TEXT,
  subtotal DECIMAL(10, 2) NOT NULL,
  discount_percent DECIMAL(5, 2) DEFAULT 0,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  tax_percent DECIMAL(5, 2) DEFAULT 18,
  tax_amount DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  payment_method TEXT,
  status order_status DEFAULT 'pending',
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(store_id, order_number)
);

-- Order items
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) NOT NULL,
  variant_id UUID REFERENCES public.product_variants(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tablet requests
CREATE TABLE public.tablet_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  reason TEXT NOT NULL,
  status tablet_request_status DEFAULT 'pending',
  admin_notes TEXT,
  processed_by UUID REFERENCES auth.users(id),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tryon_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tryon_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tablet_requests ENABLE ROW LEVEL SECURITY;

-- Helper function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Helper function to check if user belongs to store
CREATE OR REPLACE FUNCTION public.user_belongs_to_store(_user_id UUID, _store_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.stores WHERE id = _store_id AND owner_id = _user_id
    UNION
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND store_id = _store_id
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Superadmins can manage all roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'superadmin'));

-- RLS Policies for stores
CREATE POLICY "Store owners can view their stores" ON public.stores FOR SELECT USING (owner_id = auth.uid() OR public.user_belongs_to_store(auth.uid(), id) OR public.has_role(auth.uid(), 'superadmin'));
CREATE POLICY "Store owners can update their stores" ON public.stores FOR UPDATE USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'superadmin'));
CREATE POLICY "Authenticated users can create stores" ON public.stores FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Superadmins can delete stores" ON public.stores FOR DELETE USING (public.has_role(auth.uid(), 'superadmin'));

-- RLS Policies for subscription_plans (public read)
CREATE POLICY "Anyone can view subscription plans" ON public.subscription_plans FOR SELECT USING (true);

-- RLS Policies for subscriptions
CREATE POLICY "Store owners can view their subscriptions" ON public.subscriptions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.stores WHERE id = store_id AND owner_id = auth.uid()) OR public.has_role(auth.uid(), 'superadmin')
);
CREATE POLICY "Superadmins can manage subscriptions" ON public.subscriptions FOR ALL USING (public.has_role(auth.uid(), 'superadmin'));

-- RLS Policies for products and categories
CREATE POLICY "Store members can view products" ON public.products FOR SELECT USING (public.user_belongs_to_store(auth.uid(), store_id) OR public.has_role(auth.uid(), 'superadmin'));
CREATE POLICY "Store members can manage products" ON public.products FOR ALL USING (public.user_belongs_to_store(auth.uid(), store_id));

CREATE POLICY "Store members can view categories" ON public.product_categories FOR SELECT USING (public.user_belongs_to_store(auth.uid(), store_id) OR public.has_role(auth.uid(), 'superadmin'));
CREATE POLICY "Store members can manage categories" ON public.product_categories FOR ALL USING (public.user_belongs_to_store(auth.uid(), store_id));

CREATE POLICY "Store members can view variants" ON public.product_variants FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.products WHERE id = product_id AND public.user_belongs_to_store(auth.uid(), store_id))
);
CREATE POLICY "Store members can manage variants" ON public.product_variants FOR ALL USING (
  EXISTS (SELECT 1 FROM public.products WHERE id = product_id AND public.user_belongs_to_store(auth.uid(), store_id))
);

-- RLS Policies for inventory movements
CREATE POLICY "Store members can view inventory" ON public.inventory_movements FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.product_variants pv JOIN public.products p ON pv.product_id = p.id WHERE pv.id = variant_id AND public.user_belongs_to_store(auth.uid(), p.store_id))
);
CREATE POLICY "Store members can manage inventory" ON public.inventory_movements FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.product_variants pv JOIN public.products p ON pv.product_id = p.id WHERE pv.id = variant_id AND public.user_belongs_to_store(auth.uid(), p.store_id))
);

-- RLS Policies for try-on sessions (store access)
CREATE POLICY "Store members can view sessions" ON public.tryon_sessions FOR SELECT USING (public.user_belongs_to_store(auth.uid(), store_id));
CREATE POLICY "Store members can create sessions" ON public.tryon_sessions FOR INSERT WITH CHECK (public.user_belongs_to_store(auth.uid(), store_id));

CREATE POLICY "Store members can view tryon results" ON public.tryon_results FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.tryon_sessions WHERE id = session_id AND public.user_belongs_to_store(auth.uid(), store_id))
);
CREATE POLICY "Store members can create tryon results" ON public.tryon_results FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.tryon_sessions WHERE id = session_id AND public.user_belongs_to_store(auth.uid(), store_id))
);

-- RLS Policies for wishlists
CREATE POLICY "Public wishlists are viewable" ON public.wishlists FOR SELECT USING (is_public = true OR public.user_belongs_to_store(auth.uid(), store_id));
CREATE POLICY "Store members can manage wishlists" ON public.wishlists FOR ALL USING (public.user_belongs_to_store(auth.uid(), store_id));

CREATE POLICY "Public wishlist items are viewable" ON public.wishlist_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.wishlists WHERE id = wishlist_id AND (is_public = true OR public.user_belongs_to_store(auth.uid(), store_id)))
);

-- RLS Policies for orders
CREATE POLICY "Store members can view orders" ON public.orders FOR SELECT USING (public.user_belongs_to_store(auth.uid(), store_id) OR public.has_role(auth.uid(), 'superadmin'));
CREATE POLICY "Store members can create orders" ON public.orders FOR INSERT WITH CHECK (public.user_belongs_to_store(auth.uid(), store_id));
CREATE POLICY "Store members can update orders" ON public.orders FOR UPDATE USING (public.user_belongs_to_store(auth.uid(), store_id));

CREATE POLICY "Store members can view order items" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND public.user_belongs_to_store(auth.uid(), store_id))
);
CREATE POLICY "Store members can create order items" ON public.order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND public.user_belongs_to_store(auth.uid(), store_id))
);

-- RLS Policies for tablet requests
CREATE POLICY "Store owners can view their requests" ON public.tablet_requests FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.stores WHERE id = store_id AND owner_id = auth.uid()) OR public.has_role(auth.uid(), 'superadmin')
);
CREATE POLICY "Store owners can create requests" ON public.tablet_requests FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.stores WHERE id = store_id AND owner_id = auth.uid())
);
CREATE POLICY "Superadmins can manage requests" ON public.tablet_requests FOR ALL USING (public.has_role(auth.uid(), 'superadmin'));

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON public.stores FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON public.product_variants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.phone
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();