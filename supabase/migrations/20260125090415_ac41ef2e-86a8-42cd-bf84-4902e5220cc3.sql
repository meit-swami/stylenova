-- Enable realtime for inventory tracking
ALTER PUBLICATION supabase_realtime ADD TABLE public.product_variants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.inventory_movements;

-- Create function to check low stock and suggest reorder
CREATE OR REPLACE FUNCTION public.get_low_stock_items(p_store_id uuid)
RETURNS TABLE (
  variant_id uuid,
  product_name text,
  sku text,
  color text,
  size text,
  stock_quantity integer,
  low_stock_threshold integer,
  suggested_reorder_qty integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    pv.id as variant_id,
    p.name as product_name,
    pv.sku,
    pv.color,
    pv.size,
    pv.stock_quantity,
    pv.low_stock_threshold,
    GREATEST(pv.low_stock_threshold * 3 - pv.stock_quantity, 10) as suggested_reorder_qty
  FROM product_variants pv
  JOIN products p ON pv.product_id = p.id
  WHERE p.store_id = p_store_id
    AND pv.stock_quantity <= pv.low_stock_threshold
  ORDER BY pv.stock_quantity ASC;
$$;