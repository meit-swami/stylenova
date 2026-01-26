import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LoyaltyAccount {
  id: string;
  store_id: string;
  customer_phone: string;
  customer_name: string | null;
  total_points: number;
  lifetime_points: number;
  tier: string;
}

interface LoyaltyReward {
  id: string;
  store_id: string;
  name: string;
  description: string | null;
  points_required: number;
  discount_type: string;
  current_redemptions: number | null;
  discount_value: number;
  is_active: boolean;
}

// Points per ₹100 spent
const POINTS_PER_100 = 10;

export function useLoyalty(storeId: string | undefined) {
  const queryClient = useQueryClient();
  const [selectedReward, setSelectedReward] = useState<LoyaltyReward | null>(null);

  // Fetch loyalty account for a customer
  const fetchLoyaltyAccount = useCallback(async (phone: string): Promise<LoyaltyAccount | null> => {
    if (!storeId || !phone) return null;

    const { data, error } = await supabase
      .from('loyalty_accounts')
      .select('*')
      .eq('store_id', storeId)
      .eq('customer_phone', phone)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching loyalty account:', error);
    }

    return data;
  }, [storeId]);

  // Fetch available rewards for the store
  const { data: rewards = [] } = useQuery({
    queryKey: ['loyalty_rewards', storeId],
    queryFn: async () => {
      if (!storeId) return [];
      
      const { data, error } = await supabase
        .from('loyalty_rewards')
        .select('*')
        .eq('store_id', storeId)
        .eq('is_active', true)
        .order('points_required', { ascending: true });

      if (error) throw error;
      return data as LoyaltyReward[];
    },
    enabled: !!storeId,
  });

  // Create or get loyalty account
  const getOrCreateAccount = useCallback(async (
    phone: string,
    name?: string
  ): Promise<LoyaltyAccount | null> => {
    if (!storeId || !phone) return null;

    // Try to get existing account
    let account = await fetchLoyaltyAccount(phone);

    if (!account) {
      // Create new account
      const { data, error } = await supabase
        .from('loyalty_accounts')
        .insert({
          store_id: storeId,
          customer_phone: phone,
          customer_name: name || null,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating loyalty account:', error);
        return null;
      }

      account = data;
      toast.success('Welcome to our loyalty program! 🎉');
    }

    return account;
  }, [storeId, fetchLoyaltyAccount]);

  // Calculate points to earn for a purchase
  const calculatePointsToEarn = useCallback((amount: number): number => {
    return Math.floor(amount / 100) * POINTS_PER_100;
  }, []);

  // Award points after a purchase
  const awardPoints = useMutation({
    mutationFn: async ({
      phone,
      name,
      orderId,
      amount,
    }: {
      phone: string;
      name?: string;
      orderId: string;
      amount: number;
    }) => {
      const account = await getOrCreateAccount(phone, name);
      if (!account) throw new Error('Failed to get loyalty account');

      const pointsEarned = calculatePointsToEarn(amount);
      if (pointsEarned === 0) return { account, pointsEarned: 0 };

      // Create transaction
      const { error: txError } = await supabase
        .from('loyalty_transactions')
        .insert({
          loyalty_account_id: account.id,
          order_id: orderId,
          transaction_type: 'earned',
          points: pointsEarned,
          description: `Earned ${pointsEarned} points for purchase of ₹${amount}`,
        });

      if (txError) throw txError;

      // Update account points
      const { data: updatedAccount, error: updateError } = await supabase
        .from('loyalty_accounts')
        .update({
          total_points: account.total_points + pointsEarned,
          lifetime_points: account.lifetime_points + pointsEarned,
        })
        .eq('id', account.id)
        .select()
        .single();

      if (updateError) throw updateError;

      return { account: updatedAccount, pointsEarned };
    },
    onSuccess: ({ pointsEarned }) => {
      if (pointsEarned > 0) {
        toast.success(`+${pointsEarned} loyalty points earned! 🌟`);
      }
      queryClient.invalidateQueries({ queryKey: ['loyalty_accounts'] });
    },
    onError: (error: Error) => {
      console.error('Error awarding points:', error);
    },
  });

  // Redeem reward
  const redeemReward = useMutation({
    mutationFn: async ({
      phone,
      reward,
      orderId,
    }: {
      phone: string;
      reward: LoyaltyReward;
      orderId?: string;
    }) => {
      const account = await fetchLoyaltyAccount(phone);
      if (!account) throw new Error('Loyalty account not found');
      if (account.total_points < reward.points_required) {
        throw new Error('Insufficient points');
      }

      // Calculate discount
      const discountApplied = reward.discount_value;

      // Create redemption record
      const { error: redeemError } = await supabase
        .from('reward_redemptions')
        .insert({
          reward_id: reward.id,
          loyalty_account_id: account.id,
          order_id: orderId || null,
          points_spent: reward.points_required,
          discount_applied: discountApplied,
        });

      if (redeemError) throw redeemError;

      // Create transaction
      const { error: txError } = await supabase
        .from('loyalty_transactions')
        .insert({
          loyalty_account_id: account.id,
          order_id: orderId || null,
          transaction_type: 'redeemed',
          points: -reward.points_required,
          description: `Redeemed ${reward.name} for ${reward.points_required} points`,
        });

      if (txError) throw txError;

      // Update account points
      const { error: updateError } = await supabase
        .from('loyalty_accounts')
        .update({
          total_points: account.total_points - reward.points_required,
        })
        .eq('id', account.id);

      if (updateError) throw updateError;

      // Update reward redemption count
      await supabase
        .from('loyalty_rewards')
        .update({
          current_redemptions: reward.current_redemptions ? reward.current_redemptions + 1 : 1,
        })
        .eq('id', reward.id);

      return { discountApplied, reward };
    },
    onSuccess: ({ reward }) => {
      toast.success(`${reward.name} redeemed! 🎁`);
      setSelectedReward(null);
      queryClient.invalidateQueries({ queryKey: ['loyalty_accounts'] });
      queryClient.invalidateQueries({ queryKey: ['loyalty_rewards'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    rewards,
    selectedReward,
    setSelectedReward,
    fetchLoyaltyAccount,
    getOrCreateAccount,
    calculatePointsToEarn,
    awardPoints,
    redeemReward,
    POINTS_PER_100,
  };
}
