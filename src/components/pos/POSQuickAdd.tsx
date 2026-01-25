interface QuickProduct {
  id: string;
  name: string;
  price: number;
  image?: string;
  emoji?: string;
}

interface POSQuickAddProps {
  products: QuickProduct[];
  onAdd: (product: QuickProduct) => void;
}

export function POSQuickAdd({ products, onAdd }: POSQuickAddProps) {
  return (
    <div>
      <h3 className="font-medium text-muted-foreground text-xs md:text-sm mb-3">
        Quick Add
      </h3>
      <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 -mx-1 px-1">
        {products.map((product) => (
          <button
            key={product.id}
            onClick={() => onAdd(product)}
            className="flex-shrink-0 w-24 md:w-28 p-2.5 md:p-3 bg-card rounded-xl border border-border hover:border-primary transition-colors text-center touch-manipulation"
          >
            {product.image ? (
              <img 
                src={product.image} 
                alt={product.name}
                className="w-10 h-10 md:w-12 md:h-12 mx-auto rounded-lg object-cover mb-1"
              />
            ) : (
              <div className="text-xl md:text-2xl mb-1">{product.emoji || '👗'}</div>
            )}
            <p className="text-xs font-medium text-foreground truncate">{product.name}</p>
            <p className="text-xs text-muted-foreground">₹{product.price.toLocaleString()}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
