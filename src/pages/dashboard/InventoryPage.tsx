import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IconPlus, 
  IconSearch, 
  IconFilter, 
  IconEdit, 
  IconTrash,
  IconPackage,
  IconAlertTriangle,
  IconTrendingUp,
  IconRefresh,
  IconChevronDown,
  IconChevronUp,
  IconUpload,
  IconX,
  IconCheck
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAuth } from '@/hooks/useAuth';
import { useStore } from '@/hooks/useDatabase';
import { useProductsWithDetails, useCategories, useCreateProductWithVariants, useDeleteProduct, useCreateCategory } from '@/hooks/useProducts';
import { useRealtimeInventory, useLowStockItems, useInventoryStats, useUpdateStock } from '@/hooks/useInventory';
import { useFileUpload } from '@/hooks/useFileUpload';
import { toast } from 'sonner';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

interface ProductFormData {
  name: string;
  sku: string;
  description: string;
  base_price: number;
  sale_price: number | null;
  category_id: string;
  enable_tryon: boolean;
  images: string[];
  variants: {
    sku: string;
    color: string;
    size: string;
    stock_quantity: number;
    price_adjustment: number;
  }[];
}

const defaultFormData: ProductFormData = {
  name: '',
  sku: '',
  description: '',
  base_price: 0,
  sale_price: null,
  category_id: '',
  enable_tryon: true,
  images: [],
  variants: [{ sku: '', color: '', size: '', stock_quantity: 0, price_adjustment: 0 }],
};

export default function InventoryPage() {
  const { user } = useAuth();
  const { data: store } = useStore(user?.id);
  const { data: products, isLoading: productsLoading } = useProductsWithDetails(store?.id);
  const { data: categories } = useCategories(store?.id);
  const { data: stats } = useInventoryStats(store?.id);
  const { data: lowStockItems } = useLowStockItems(store?.id);
  
  const createProduct = useCreateProductWithVariants();
  const deleteProduct = useDeleteProduct();
  const createCategory = useCreateCategory();
  const updateStock = useUpdateStock();
  const { uploadFile, uploading } = useFileUpload();
  
  // Enable realtime updates
  useRealtimeInventory(store?.id);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showLowStock, setShowLowStock] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>(defaultFormData);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);

  const filteredProducts = products?.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !user?.id) return;

    for (const file of Array.from(files)) {
      const url = await uploadFile(file, { folder: `${user.id}/products` });
      if (url) {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, url],
        }));
      }
    }
  };

  const handleAddVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { sku: '', color: '', size: '', stock_quantity: 0, price_adjustment: 0 }],
    }));
  };

  const handleRemoveVariant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  const handleUpdateVariant = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((v, i) => i === index ? { ...v, [field]: value } : v),
    }));
  };

  const handleSubmitProduct = async () => {
    if (!store?.id) return;

    try {
      await createProduct.mutateAsync({
        name: formData.name,
        sku: formData.sku,
        description: formData.description,
        base_price: formData.base_price,
        sale_price: formData.sale_price || undefined,
        category_id: formData.category_id || undefined,
        images: formData.images,
        enable_tryon: formData.enable_tryon,
        store_id: store.id,
        variants: formData.variants.filter(v => v.sku).map(v => ({
          sku: v.sku,
          color: v.color || undefined,
          size: v.size || undefined,
          stock_quantity: v.stock_quantity,
          price_adjustment: v.price_adjustment,
        })),
      });

      setShowAddProduct(false);
      setFormData(defaultFormData);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleCreateCategory = async () => {
    if (!store?.id || !newCategory.name) return;

    try {
      await createCategory.mutateAsync({
        name: newCategory.name,
        slug: newCategory.name.toLowerCase().replace(/\s+/g, '-'),
        description: newCategory.description,
        store_id: store.id,
      });

      setShowAddCategory(false);
      setNewCategory({ name: '', description: '' });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleRestock = async (variantId: string, quantity: number) => {
    await updateStock.mutateAsync({
      variantId,
      quantity,
      movementType: 'restock',
      notes: 'Restock from low stock alert',
    });
  };

  const getStockStatus = (variants: any[]) => {
    const totalStock = variants?.reduce((sum, v) => sum + v.stock_quantity, 0) || 0;
    const lowThreshold = variants?.[0]?.low_stock_threshold || 5;
    
    if (totalStock === 0) return 'out_of_stock';
    if (totalStock <= lowThreshold) return 'low_stock';
    return 'in_stock';
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            Inventory Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time stock tracking with smart alerts
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setShowLowStock(true)}>
            <IconAlertTriangle className="w-4 h-4" />
            Low Stock ({lowStockItems?.length || 0})
          </Button>
          <Button variant="hero" onClick={() => setShowAddProduct(true)}>
            <IconPlus className="w-4 h-4" />
            Add Product
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid sm:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <IconPackage className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats?.totalVariants || 0}</p>
              <p className="text-sm text-muted-foreground">Total Variants</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <IconTrendingUp className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats?.inStock || 0}</p>
              <p className="text-sm text-muted-foreground">In Stock</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <IconAlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats?.lowStock || 0}</p>
              <p className="text-sm text-muted-foreground">Low Stock</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <IconPackage className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats?.outOfStock || 0}</p>
              <p className="text-sm text-muted-foreground">Out of Stock</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search products by name or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <IconFilter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories?.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={() => setShowAddCategory(true)}>
          <IconPlus className="w-4 h-4" />
          Category
        </Button>
      </motion.div>

      {/* Products Table */}
      <motion.div variants={itemVariants} className="bg-card rounded-2xl border border-border overflow-hidden">
        {productsLoading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center">
            <IconPackage className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium text-foreground mb-2">No products yet</p>
            <p className="text-muted-foreground mb-4">Add your first product to get started</p>
            <Button variant="hero" onClick={() => setShowAddProduct(true)}>
              <IconPlus className="w-4 h-4" />
              Add Product
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left p-4 font-medium text-muted-foreground">Product</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">SKU</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Category</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Variants</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Price</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Stock</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const status = getStockStatus(product.variants);
                  const totalStock = product.variants?.reduce((sum: number, v: any) => sum + v.stock_quantity, 0) || 0;
                  
                  return (
                    <motion.tr
                      key={product.id}
                      variants={itemVariants}
                      className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => setExpandedProduct(expandedProduct === product.id ? null : product.id)}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center overflow-hidden">
                            {product.images?.[0] ? (
                              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <IconPackage className="w-6 h-6 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <span className="font-medium text-foreground">{product.name}</span>
                            {product.enable_tryon && (
                              <Badge variant="secondary" className="ml-2 text-xs">Try-On</Badge>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground">{product.sku}</td>
                      <td className="p-4 text-muted-foreground">{product.category?.name || '-'}</td>
                      <td className="p-4">
                        <div className="flex gap-1 flex-wrap">
                          {product.variants?.slice(0, 3).map((variant: any) => (
                            <span key={variant.id} className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                              {variant.color || variant.size || variant.sku}
                            </span>
                          ))}
                          {(product.variants?.length || 0) > 3 && (
                            <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                              +{product.variants.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <span className="font-medium text-foreground">₹{product.base_price.toLocaleString()}</span>
                          {product.sale_price && (
                            <span className="text-sm text-muted-foreground line-through ml-2">
                              ₹{product.sale_price.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 font-medium text-foreground">{totalStock}</td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          status === 'in_stock' ? 'bg-emerald-500/10 text-emerald-500' :
                          status === 'low_stock' ? 'bg-amber-500/10 text-amber-500' :
                          'bg-destructive/10 text-destructive'
                        }`}>
                          {status === 'in_stock' ? 'In Stock' :
                           status === 'low_stock' ? 'Low Stock' : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                            <IconEdit className="w-4 h-4 text-muted-foreground" />
                          </button>
                          <button 
                            className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                            onClick={() => store?.id && deleteProduct.mutate({ id: product.id, storeId: store.id })}
                          >
                            <IconTrash className="w-4 h-4 text-destructive" />
                          </button>
                          {expandedProduct === product.id ? (
                            <IconChevronUp className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <IconChevronDown className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Add Product Dialog */}
      <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Create a new product with variants and stock levels
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Silk Saree - Royal Blue"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="SAR-001"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Product description..."
                rows={3}
              />
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="base_price">Base Price (₹)</Label>
                <Input
                  id="base_price"
                  type="number"
                  value={formData.base_price}
                  onChange={(e) => setFormData({ ...formData, base_price: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sale_price">Sale Price (₹)</Label>
                <Input
                  id="sale_price"
                  type="number"
                  value={formData.sale_price || ''}
                  onChange={(e) => setFormData({ ...formData, sale_price: e.target.value ? Number(e.target.value) : null })}
                  placeholder="Optional"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category_id} onValueChange={(v) => setFormData({ ...formData, category_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Images */}
            <div className="space-y-2">
              <Label>Product Images</Label>
              <div className="flex gap-2 flex-wrap">
                {formData.images.map((img, idx) => (
                  <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                      onClick={() => setFormData({ ...formData, images: formData.images.filter((_, i) => i !== idx) })}
                    >
                      <IconX className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <label className="w-20 h-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                  {uploading ? (
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <IconUpload className="w-5 h-5 text-muted-foreground" />
                  )}
                </label>
              </div>
            </div>

            {/* Variants */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Variants</Label>
                <Button type="button" variant="outline" size="sm" onClick={handleAddVariant}>
                  <IconPlus className="w-4 h-4" />
                  Add Variant
                </Button>
              </div>

              {formData.variants.map((variant, idx) => (
                <div key={idx} className="p-4 rounded-lg border border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Variant {idx + 1}</span>
                    {formData.variants.length > 1 && (
                      <button onClick={() => handleRemoveVariant(idx)}>
                        <IconX className="w-4 h-4 text-destructive" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <Input
                      placeholder="SKU"
                      value={variant.sku}
                      onChange={(e) => handleUpdateVariant(idx, 'sku', e.target.value)}
                    />
                    <Input
                      placeholder="Color"
                      value={variant.color}
                      onChange={(e) => handleUpdateVariant(idx, 'color', e.target.value)}
                    />
                    <Input
                      placeholder="Size"
                      value={variant.size}
                      onChange={(e) => handleUpdateVariant(idx, 'size', e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Stock"
                      value={variant.stock_quantity}
                      onChange={(e) => handleUpdateVariant(idx, 'stock_quantity', Number(e.target.value))}
                    />
                    <Input
                      type="number"
                      placeholder="Price adj."
                      value={variant.price_adjustment}
                      onChange={(e) => handleUpdateVariant(idx, 'price_adjustment', Number(e.target.value))}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddProduct(false)}>Cancel</Button>
            <Button variant="hero" onClick={handleSubmitProduct} disabled={createProduct.isPending}>
              {createProduct.isPending ? 'Creating...' : 'Create Product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Category Dialog */}
      <Dialog open={showAddCategory} onOpenChange={setShowAddCategory}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Category Name</Label>
              <Input
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                placeholder="e.g., Sarees, Lehengas"
              />
            </div>
            <div className="space-y-2">
              <Label>Description (Optional)</Label>
              <Textarea
                value={newCategory.description}
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                placeholder="Category description..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddCategory(false)}>Cancel</Button>
            <Button variant="hero" onClick={handleCreateCategory} disabled={createCategory.isPending}>
              {createCategory.isPending ? 'Creating...' : 'Create Category'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Low Stock Sheet */}
      <Sheet open={showLowStock} onOpenChange={setShowLowStock}>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <IconAlertTriangle className="w-5 h-5 text-amber-500" />
              Low Stock Alerts
            </SheetTitle>
            <SheetDescription>
              Items that need restocking with AI-suggested quantities
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            {lowStockItems?.length === 0 ? (
              <div className="text-center py-8">
                <IconCheck className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                <p className="text-lg font-medium text-foreground">All stocked up!</p>
                <p className="text-muted-foreground">No low stock items at the moment</p>
              </div>
            ) : (
              lowStockItems?.map((item: any) => (
                <div key={item.variant_id} className="p-4 rounded-xl border border-border">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium text-foreground">{item.product_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.color && `${item.color} • `}
                        {item.size && `${item.size} • `}
                        SKU: {item.sku}
                      </p>
                    </div>
                    <Badge variant={item.stock_quantity === 0 ? "destructive" : "secondary"}>
                      {item.stock_quantity} left
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Suggested reorder: </span>
                      <span className="font-medium text-foreground">{item.suggested_reorder_qty} units</span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleRestock(item.variant_id, item.suggested_reorder_qty)}
                      disabled={updateStock.isPending}
                    >
                      <IconRefresh className="w-4 h-4 mr-1" />
                      Restock
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>
    </motion.div>
  );
}
