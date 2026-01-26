import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconGift, IconStar, IconLoader2, IconCheck } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLoyalty } from '@/hooks/useLoyalty';

interface LoyaltyWidgetProps {
  storeId: string | undefined;
  customerPhone: string;
  orderTotal: number;
  onRewardSelect: (discount: number, pointsUsed: number) => void;
  onPointsEarnedPreview: (points: number) => void;
}

export function LoyaltyWidget({
  storeId,
  customerPhone,
  orderTotal,
  onRewardSelect,
  onPointsEarnedPreview,
}: LoyaltyWidgetProps) {
  const {
    rewards,
    fetchLoyaltyAccount,
    calculatePointsToEarn,
    POINTS_PER_100,
  } = useLoyalty(storeId);

  const [account, setAccount] = useState<{
    id: string;
    total_points: number;
    tier: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedRewardId, setSelectedRewardId] = useState<string | null>(null);

  // Fetch account when phone changes
  useEffect(() => {
    async function loadAccount() {
      if (!customerPhone || customerPhone.length < 10) {
        setAccount(null);
        return;
      }

      setLoading(true);
      try {
        const acc = await fetchLoyaltyAccount(customerPhone);
        setAccount(acc);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadAccount();
  }, [customerPhone, fetchLoyaltyAccount]);

  // Calculate points to earn
  const pointsToEarn = calculatePointsToEarn(orderTotal);

  useEffect(() => {
    onPointsEarnedPreview(pointsToEarn);
  }, [pointsToEarn, onPointsEarnedPreview]);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'platinum': return 'bg-slate-500';
      case 'gold': return 'bg-amber-500';
      case 'silver': return 'bg-gray-400';
      default: return 'bg-orange-600';
    }
  };

  const handleRewardSelect = (reward: typeof rewards[0]) => {
    if (!account || account.total_points < reward.points_required) return;

    if (selectedRewardId === reward.id) {
      // Deselect
      setSelectedRewardId(null);
      onRewardSelect(0, 0);
    } else {
      // Select
      setSelectedRewardId(reward.id);
      const discount = reward.discount_type === 'percentage'
        ? (orderTotal * reward.discount_value) / 100
        : reward.discount_value;
      onRewardSelect(discount, reward.points_required);
    }
  };

  if (!customerPhone || customerPhone.length < 10) {
    return (
      <div className="bg-muted/50 rounded-lg p-3 text-center">
        <IconGift className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">
          Enter customer phone to view loyalty points
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-muted/50 rounded-lg p-3 text-center">
        <IconLoader2 className="w-5 h-5 mx-auto animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-3 space-y-3">
      {/* Points Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconStar className="w-5 h-5 text-amber-500" />
          <span className="text-sm font-medium">Loyalty Points</span>
        </div>
        {account && (
          <Badge className={`${getTierColor(account.tier)} text-white text-xs`}>
            {account.tier.toUpperCase()}
          </Badge>
        )}
      </div>

      {account ? (
        <>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Available Points:</span>
            <span className="font-semibold">{account.total_points}</span>
          </div>

          {/* Points to Earn */}
          {pointsToEarn > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Will Earn:</span>
              <span className="font-medium">+{pointsToEarn} pts</span>
            </div>
          )}

          {/* Available Rewards */}
          {rewards.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">Redeem Rewards:</p>
              <div className="space-y-1.5">
                <AnimatePresence>
                  {rewards.slice(0, 3).map((reward) => {
                    const canRedeem = account.total_points >= reward.points_required;
                    const isSelected = selectedRewardId === reward.id;

                    return (
                      <motion.div
                        key={reward.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                      >
                        <Button
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          className={`w-full justify-between h-auto py-2 ${
                            !canRedeem ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          onClick={() => handleRewardSelect(reward)}
                          disabled={!canRedeem}
                        >
                          <div className="flex flex-col items-start text-left">
                            <span className="text-xs font-medium">{reward.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {reward.discount_type === 'percentage'
                                ? `${reward.discount_value}% off`
                                : `₹${reward.discount_value} off`
                              }
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            {isSelected && <IconCheck className="w-4 h-4" />}
                            <Badge variant="secondary" className="text-xs">
                              {reward.points_required} pts
                            </Badge>
                          </div>
                        </Button>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-2">
          <p className="text-xs text-muted-foreground mb-1">New customer!</p>
          <p className="text-xs">
            Will earn <span className="font-semibold text-green-600">+{pointsToEarn} pts</span> with this purchase
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            ({POINTS_PER_100} points per ₹100)
          </p>
        </div>
      )}
    </div>
  );
}
