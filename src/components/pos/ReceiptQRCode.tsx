import { QRCodeSVG } from 'qrcode.react';

interface ReceiptQRCodeProps {
  phone: string;
  storeId: string;
  size?: number;
}

export function ReceiptQRCode({ phone, storeId, size = 80 }: ReceiptQRCodeProps) {
  // Generate the URL for order history
  const baseUrl = window.location.origin;
  const historyUrl = `${baseUrl}/order-history?phone=${encodeURIComponent(phone)}&store=${encodeURIComponent(storeId)}`;

  return (
    <div className="flex flex-col items-center gap-1">
      <QRCodeSVG
        value={historyUrl}
        size={size}
        level="M"
        includeMargin={false}
      />
      <p className="text-xs text-center text-gray-500">
        Scan for purchase history
      </p>
    </div>
  );
}
