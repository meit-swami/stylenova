import { useState, useEffect } from 'react';
import { IconSearch, IconBarcode } from '@tabler/icons-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { usePOS } from '@/hooks/usePOS';
import { BarcodeScanner } from './BarcodeScanner';

interface Product {
  id: string;
  name: string;
  sku: string;
  base_price: number;
  sale_price?: number | null;
  images?: string[] | null;
  product_variants?: Array<{
    id: string;
    sku: string;
    color?: string | null;
    size?: string | null;
    stock_quantity: number;
    price_adjustment?: number | null;
  }>;
}

interface POSSearchProps {
  storeId: string;
  onAddToCart: (item: {
    id: string;
    productId: string;
    variantId?: string;
    name: string;
    sku: string;
    price: number;
    image?: string;
    color?: string;
    size?: string;
  }) => void;
}

export function POSSearch({ storeId, onAddToCart }: POSSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const { searchProducts } = usePOS();

  useEffect(() => {
    const search = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      setIsSearching(true);
      const data = await searchProducts(query, storeId);
      setResults(data);
      setIsSearching(false);
    };

    const debounce = setTimeout(search, 300);
    return () => clearTimeout(debounce);
  }, [query, storeId, searchProducts]);

  const handleSelectProduct = (product: Product, variant?: Product['product_variants'][0]) => {
    const price = variant
      ? (product.sale_price || product.base_price) + (variant.price_adjustment || 0)
      : product.sale_price || product.base_price;

    onAddToCart({
      id: variant ? `${product.id}-${variant.id}` : product.id,
      productId: product.id,
      variantId: variant?.id,
      name: product.name,
      sku: variant?.sku || product.sku,
      price,
      image: product.images?.[0],
      color: variant?.color || undefined,
      size: variant?.size || undefined,
    });

    setQuery('');
    setResults([]);
  };

  const handleBarcodeScan = async (barcode: string) => {
    setQuery(barcode);
    setIsSearching(true);
    
    // Search by the scanned barcode (SKU)
    const data = await searchProducts(barcode, storeId);
    
    if (data.length === 1) {
      // If exactly one product found, add it directly
      const product = data[0];
      if (product.product_variants && product.product_variants.length === 1) {
        handleSelectProduct(product, product.product_variants[0]);
      } else if (!product.product_variants || product.product_variants.length === 0) {
        handleSelectProduct(product);
      } else {
        // Multiple variants, show in results
        setResults(data);
      }
    } else {
      setResults(data);
    }
    
    setIsSearching(false);
  };

  return (
    <div className="relative">
      <div className="relative flex gap-2">
        <div className="relative flex-1">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search by name or SKU..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 h-11 md:h-12 text-base md:text-lg"
          />
        </div>
        <Button
          variant="outline"
          size="lg"
          onClick={() => setShowScanner(true)}
          className="h-11 md:h-12 px-4"
        >
          <IconBarcode className="w-5 h-5" />
          <span className="hidden sm:inline ml-2">Scan</span>
        </Button>
      </div>

      {/* Barcode Scanner Dialog */}
      <BarcodeScanner
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={handleBarcodeScan}
      />

      {/* Search Results Dropdown */}
      {results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl z-50 max-h-80 overflow-y-auto">
          {results.map((product) => (
            <div key={product.id} className="border-b border-border last:border-b-0">
              {/* If product has variants, show each variant */}
              {product.product_variants && product.product_variants.length > 0 ? (
                product.product_variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => handleSelectProduct(product, variant)}
                    disabled={variant.stock_quantity <= 0}
                    className="w-full p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left disabled:opacity-50 touch-manipulation"
                  >
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-lg">
                        👗
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm truncate">
                        {product.name}
                        {variant.color && ` - ${variant.color}`}
                        {variant.size && ` (${variant.size})`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        SKU: {variant.sku} • Stock: {variant.stock_quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">
                        ₹{((product.sale_price || product.base_price) + (variant.price_adjustment || 0)).toLocaleString()}
                      </p>
                    </div>
                  </button>
                ))
              ) : (
                <button
                  onClick={() => handleSelectProduct(product)}
                  className="w-full p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left touch-manipulation"
                >
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-lg">
                      👗
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">
                      ₹{(product.sale_price || product.base_price).toLocaleString()}
                    </p>
                  </div>
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {isSearching && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl p-4 text-center text-muted-foreground">
          Searching...
        </div>
      )}
    </div>
  );
}
