import { 
  IconPlus, 
  IconMinus, 
  IconTrash 
} from '@tabler/icons-react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  color?: string;
  size?: string;
}

interface POSCartProps {
  items: CartItem[];
  onUpdateQuantity: (id: string, change: number) => void;
  onRemoveItem: (id: string) => void;
}

export function POSCart({ items, onUpdateQuantity, onRemoveItem }: POSCartProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <div className="text-5xl mb-4">🛒</div>
        <p className="font-medium">No items in cart</p>
        <p className="text-sm">Scan barcode or search to add products</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-3 md:gap-4 p-3 rounded-xl bg-muted/50"
        >
          {/* Product Image/Icon */}
          {item.image ? (
            <img 
              src={item.image} 
              alt={item.name}
              className="w-12 h-12 md:w-14 md:h-14 rounded-lg object-cover"
            />
          ) : (
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg bg-muted flex items-center justify-center text-2xl">
              👗
            </div>
          )}

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground text-sm md:text-base truncate">
              {item.name}
            </p>
            <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
              <span>₹{item.price.toLocaleString()}</span>
              {item.color && <span>• {item.color}</span>}
              {item.size && <span>• {item.size}</span>}
            </div>
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center gap-1 md:gap-2">
            <button
              onClick={() => onUpdateQuantity(item.id, -1)}
              className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-muted-foreground/20 transition-colors touch-manipulation"
            >
              <IconMinus className="w-3 h-3 md:w-4 md:h-4" />
            </button>
            <span className="w-6 md:w-8 text-center font-medium text-sm md:text-base">
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(item.id, 1)}
              className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-muted-foreground/20 transition-colors touch-manipulation"
            >
              <IconPlus className="w-3 h-3 md:w-4 md:h-4" />
            </button>
          </div>

          {/* Item Total */}
          <div className="text-right min-w-16 md:min-w-20">
            <p className="font-semibold text-foreground text-sm md:text-base">
              ₹{(item.price * item.quantity).toLocaleString()}
            </p>
          </div>

          {/* Remove Button */}
          <button
            onClick={() => onRemoveItem(item.id)}
            className="p-2 rounded-lg hover:bg-destructive/10 transition-colors touch-manipulation"
          >
            <IconTrash className="w-4 h-4 text-destructive" />
          </button>
        </div>
      ))}
    </div>
  );
}
