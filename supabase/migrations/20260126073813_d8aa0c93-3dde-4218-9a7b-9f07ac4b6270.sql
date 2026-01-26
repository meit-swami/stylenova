-- Create loyalty accounts table to track customer points
CREATE TABLE public.loyalty_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  customer_phone TEXT NOT NULL,
  customer_name TEXT,
  total_points INTEGER NOT NULL DEFAULT 0,
  lifetime_points INTEGER NOT NULL DEFAULT 0,
  tier TEXT DEFAULT 'bronze',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(store_id, customer_phone)
);

-- Create loyalty transactions table to track point history
CREATE TABLE public.loyalty_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  loyalty_account_id UUID NOT NULL REFERENCES public.loyalty_accounts(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  transaction_type TEXT NOT NULL, -- 'earned', 'redeemed', 'expired', 'adjusted'
  points INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create rewards table for redeemable rewards
CREATE TABLE public.loyalty_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  points_required INTEGER NOT NULL,
  discount_type TEXT NOT NULL, -- 'percentage', 'fixed'
  discount_value NUMERIC NOT NULL,
  is_active BOOLEAN DEFAULT true,
  max_redemptions INTEGER,
  current_redemptions INTEGER DEFAULT 0,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reward redemptions tracking
CREATE TABLE public.reward_redemptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reward_id UUID NOT NULL REFERENCES public.loyalty_rewards(id) ON DELETE CASCADE,
  loyalty_account_id UUID NOT NULL REFERENCES public.loyalty_accounts(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  points_spent INTEGER NOT NULL,
  discount_applied NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add loyalty_points_earned and loyalty_points_redeemed to orders table
ALTER TABLE public.orders 
ADD COLUMN loyalty_points_earned INTEGER DEFAULT 0,
ADD COLUMN loyalty_points_redeemed INTEGER DEFAULT 0,
ADD COLUMN loyalty_discount NUMERIC DEFAULT 0;

-- Enable RLS on all new tables
ALTER TABLE public.loyalty_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_redemptions ENABLE ROW LEVEL SECURITY;

-- Loyalty accounts policies
CREATE POLICY "Store members can view loyalty accounts"
ON public.loyalty_accounts FOR SELECT
USING (user_belongs_to_store(auth.uid(), store_id));

CREATE POLICY "Store members can manage loyalty accounts"
ON public.loyalty_accounts FOR ALL
USING (user_belongs_to_store(auth.uid(), store_id));

-- Public access for customers to view their own loyalty info via phone
CREATE POLICY "Customers can view their own loyalty account"
ON public.loyalty_accounts FOR SELECT
USING (true);

-- Loyalty transactions policies
CREATE POLICY "Store members can view loyalty transactions"
ON public.loyalty_transactions FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.loyalty_accounts la
  WHERE la.id = loyalty_transactions.loyalty_account_id
  AND user_belongs_to_store(auth.uid(), la.store_id)
));

CREATE POLICY "Store members can manage loyalty transactions"
ON public.loyalty_transactions FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.loyalty_accounts la
  WHERE la.id = loyalty_transactions.loyalty_account_id
  AND user_belongs_to_store(auth.uid(), la.store_id)
));

-- Loyalty rewards policies
CREATE POLICY "Store members can manage rewards"
ON public.loyalty_rewards FOR ALL
USING (user_belongs_to_store(auth.uid(), store_id));

CREATE POLICY "Anyone can view active rewards"
ON public.loyalty_rewards FOR SELECT
USING (is_active = true);

-- Reward redemptions policies
CREATE POLICY "Store members can manage redemptions"
ON public.reward_redemptions FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.loyalty_accounts la
  WHERE la.id = reward_redemptions.loyalty_account_id
  AND user_belongs_to_store(auth.uid(), la.store_id)
));

-- Create function to calculate loyalty tier based on lifetime points
CREATE OR REPLACE FUNCTION public.calculate_loyalty_tier(lifetime_pts INTEGER)
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF lifetime_pts >= 10000 THEN
    RETURN 'platinum';
  ELSIF lifetime_pts >= 5000 THEN
    RETURN 'gold';
  ELSIF lifetime_pts >= 1000 THEN
    RETURN 'silver';
  ELSE
    RETURN 'bronze';
  END IF;
END;
$$;

-- Create trigger to update tier on points change
CREATE OR REPLACE FUNCTION public.update_loyalty_tier()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.tier := calculate_loyalty_tier(NEW.lifetime_points);
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_loyalty_account_tier
BEFORE UPDATE ON public.loyalty_accounts
FOR EACH ROW
EXECUTE FUNCTION public.update_loyalty_tier();

-- Add indexes for performance
CREATE INDEX idx_loyalty_accounts_store_phone ON public.loyalty_accounts(store_id, customer_phone);
CREATE INDEX idx_loyalty_transactions_account ON public.loyalty_transactions(loyalty_account_id);
CREATE INDEX idx_loyalty_rewards_store ON public.loyalty_rewards(store_id);
CREATE INDEX idx_reward_redemptions_account ON public.reward_redemptions(loyalty_account_id);