import { IconCash, IconCreditCard, IconQrcode, IconReceipt, IconPrinter } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';

interface POSCheckoutProps {
  subtotal: number;
  discount: number;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  cartItemCount: number;
  isProcessing: boolean;
  onDiscountChange: (discount: number) => void;
  onCompleteSale: (method: 'cash' | 'card' | 'upi') => void;
  onPrintReceipt: () => void;
}

const discountOptions = [0, 5, 10, 15, 20];

export function POSCheckout({
  subtotal,
  discount,
  discountAmount,
  taxRate,
  taxAmount,
  total,
  cartItemCount,
  isProcessing,
  onDiscountChange,
  onCompleteSale,
  onPrintReceipt,
}: POSCheckoutProps) {
  const isEmpty = cartItemCount === 0;

  return (
    <div className="bg-card rounded-2xl border border-border flex-1 flex flex-col">
      <div className="p-4 md:p-6 border-b border-border">
        <h2 className="font-display text-base md:text-lg font-semibold text-foreground">
          Order Summary
        </h2>
      </div>

      <div className="p-4 md:p-6 flex-1">
        {/* Discount Selection */}
        <div className="mb-4 md:mb-6">
          <label className="text-xs md:text-sm font-medium text-muted-foreground mb-2 block">
            Discount
          </label>
          <div className="flex gap-1.5 md:gap-2 flex-wrap">
            {discountOptions.map((d) => (
              <button
                key={d}
                onClick={() => onDiscountChange(d)}
                disabled={isEmpty}
                className={`flex-1 min-w-[3rem] py-2 rounded-lg text-xs md:text-sm font-medium transition-colors touch-manipulation ${
                  discount === d
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted-foreground/20 disabled:opacity-50'
                }`}
              >
                {d}%
              </button>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="space-y-2 md:space-y-3 text-sm md:text-base">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span>₹{subtotal.toLocaleString()}</span>
          </div>
          
          {discount > 0 && (
            <div className="flex justify-between text-success">
              <span>Discount ({discount}%)</span>
              <span>-₹{discountAmount.toLocaleString()}</span>
            </div>
          )}
          
          <div className="flex justify-between text-muted-foreground">
            <span>GST ({(taxRate * 100).toFixed(0)}%)</span>
            <span>₹{taxAmount.toLocaleString()}</span>
          </div>
          
          <hr className="border-border my-2" />
          
          <div className="flex justify-between text-lg md:text-xl font-bold text-foreground">
            <span>Total</span>
            <span>₹{total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="p-4 md:p-6 border-t border-border space-y-3">
        <h3 className="font-medium text-muted-foreground text-xs md:text-sm mb-3">
          Payment Method
        </h3>
        
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            className="flex-col h-auto py-3 md:py-4 touch-manipulation"
            disabled={isEmpty || isProcessing}
            onClick={() => onCompleteSale('cash')}
          >
            <IconCash className="w-5 h-5 md:w-6 md:h-6 mb-1" />
            <span className="text-xs">Cash</span>
          </Button>
          <Button
            variant="outline"
            className="flex-col h-auto py-3 md:py-4 touch-manipulation"
            disabled={isEmpty || isProcessing}
            onClick={() => onCompleteSale('card')}
          >
            <IconCreditCard className="w-5 h-5 md:w-6 md:h-6 mb-1" />
            <span className="text-xs">Card</span>
          </Button>
          <Button
            variant="outline"
            className="flex-col h-auto py-3 md:py-4 touch-manipulation"
            disabled={isEmpty || isProcessing}
            onClick={() => onCompleteSale('upi')}
          >
            <IconQrcode className="w-5 h-5 md:w-6 md:h-6 mb-1" />
            <span className="text-xs">UPI</span>
          </Button>
        </div>

        <Button
          variant="hero"
          size="xl"
          className="w-full touch-manipulation"
          disabled={isEmpty || isProcessing}
          onClick={() => onCompleteSale('cash')}
        >
          <IconReceipt className="w-5 h-5" />
          {isProcessing ? 'Processing...' : 'Complete Sale'}
        </Button>

        <Button
          variant="outline"
          className="w-full touch-manipulation"
          disabled={isEmpty}
          onClick={onPrintReceipt}
        >
          <IconPrinter className="w-4 h-4" />
          Print Receipt
        </Button>
      </div>
    </div>
  );
}
