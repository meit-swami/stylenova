import { forwardRef } from 'react';
import { format } from 'date-fns';
import { ReceiptQRCode } from './ReceiptQRCode';

interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

interface ReceiptProps {
  orderNumber: string;
  storeName: string;
  storeAddress?: string;
  storeId?: string;
  gstNumber?: string;
  items: ReceiptItem[];
  subtotal: number;
  discount: number;
  discountAmount: number;
  loyaltyDiscount?: number;
  loyaltyPointsEarned?: number;
  loyaltyPointsRedeemed?: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  paymentMethod: string;
  customerName?: string;
  customerPhone?: string;
  date: Date;
}

export const POSReceipt = forwardRef<HTMLDivElement, ReceiptProps>(({
  orderNumber,
  storeName,
  storeAddress,
  storeId,
  gstNumber,
  items,
  subtotal,
  discount,
  discountAmount,
  loyaltyDiscount = 0,
  loyaltyPointsEarned = 0,
  loyaltyPointsRedeemed = 0,
  taxRate,
  taxAmount,
  total,
  paymentMethod,
  customerName,
  customerPhone,
  date,
}, ref) => {
  return (
    <div ref={ref} className="bg-white text-black p-6 max-w-sm mx-auto font-mono text-sm">
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-xl font-bold">{storeName}</h1>
        {storeAddress && <p className="text-xs">{storeAddress}</p>}
        {gstNumber && <p className="text-xs">GSTIN: {gstNumber}</p>}
        <div className="border-b border-dashed border-black my-2" />
      </div>

      {/* Order Info */}
      <div className="mb-4 text-xs">
        <div className="flex justify-between">
          <span>Order #:</span>
          <span>{orderNumber}</span>
        </div>
        <div className="flex justify-between">
          <span>Date:</span>
          <span>{format(date, 'dd/MM/yyyy HH:mm')}</span>
        </div>
        {customerName && (
          <div className="flex justify-between">
            <span>Customer:</span>
            <span>{customerName}</span>
          </div>
        )}
        {customerPhone && (
          <div className="flex justify-between">
            <span>Phone:</span>
            <span>{customerPhone}</span>
          </div>
        )}
      </div>

      <div className="border-b border-dashed border-black my-2" />

      {/* Items */}
      <div className="mb-4">
        <div className="flex justify-between font-bold text-xs mb-1">
          <span>Item</span>
          <span>Amount</span>
        </div>
        {items.map((item, index) => (
          <div key={index} className="mb-1">
            <div className="flex justify-between">
              <span className="flex-1 truncate">{item.name}</span>
              <span>₹{item.total.toLocaleString()}</span>
            </div>
            <div className="text-xs text-gray-600 pl-2">
              {item.quantity} x ₹{item.price.toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      <div className="border-b border-dashed border-black my-2" />

      {/* Totals */}
      <div className="mb-4 text-xs">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>₹{subtotal.toLocaleString()}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between">
            <span>Discount ({discount}%):</span>
            <span>-₹{discountAmount.toLocaleString()}</span>
          </div>
        )}
        {loyaltyDiscount > 0 && (
          <div className="flex justify-between text-green-700">
            <span>Loyalty Reward:</span>
            <span>-₹{loyaltyDiscount.toLocaleString()}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>GST ({(taxRate * 100).toFixed(0)}%):</span>
          <span>₹{taxAmount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between font-bold text-base mt-2">
          <span>TOTAL:</span>
          <span>₹{total.toLocaleString()}</span>
        </div>
      </div>

      <div className="border-b border-dashed border-black my-2" />

      {/* Loyalty Points */}
      {(loyaltyPointsEarned > 0 || loyaltyPointsRedeemed > 0) && (
        <>
          <div className="text-center text-xs mb-2">
            {loyaltyPointsEarned > 0 && (
              <p className="text-green-700 font-medium">⭐ +{loyaltyPointsEarned} loyalty points earned!</p>
            )}
            {loyaltyPointsRedeemed > 0 && (
              <p className="text-orange-700">🎁 {loyaltyPointsRedeemed} points redeemed</p>
            )}
          </div>
          <div className="border-b border-dashed border-black my-2" />
        </>
      )}

      {/* Payment Method */}
      <div className="text-center text-xs mb-4">
        <p>Paid via: {paymentMethod.toUpperCase()}</p>
      </div>

      {/* QR Code for Purchase History */}
      {customerPhone && storeId && (
        <>
          <div className="flex justify-center my-4">
            <ReceiptQRCode phone={customerPhone} storeId={storeId} />
          </div>
          <div className="border-b border-dashed border-black my-2" />
        </>
      )}

      {/* Footer */}
      <div className="text-center text-xs">
        <p className="font-bold mb-1">Thank you for shopping with us!</p>
        <p>Powered by StyleNova ✨</p>
        <p className="mt-2 text-gray-500">This is a computer generated receipt</p>
      </div>
    </div>
  );
});

POSReceipt.displayName = 'POSReceipt';
