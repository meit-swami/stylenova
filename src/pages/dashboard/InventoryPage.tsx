import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  IconPlus, 
  IconSearch, 
  IconFilter, 
  IconEdit, 
  IconTrash,
  IconPackage,
  IconAlertTriangle,
  IconTrendingUp
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const categories = [
  'All Categories',
  'Sarees',
  'Lehengas',
  'Suits',
  'Kurtis',
  'Jeans',
  'Shirts',
  'Jewellery',
];

const products = [
  {
    id: 1,
    name: 'Silk Saree - Royal Blue',
    sku: 'SAR-001',
    category: 'Sarees',
    price: '₹4,599',
    stock: 25,
    variants: ['Red', 'Blue', 'Green'],
    sizes: ['Free Size'],
    status: 'active',
    image: '🥻',
  },
  {
    id: 2,
    name: 'Designer Lehenga Set',
    sku: 'LEH-002',
    category: 'Lehengas',
    price: '₹12,999',
    stock: 8,
    variants: ['Pink', 'Gold'],
    sizes: ['S', 'M', 'L', 'XL'],
    status: 'active',
    image: '👗',
  },
  {
    id: 3,
    name: 'Gold Necklace - Temple',
    sku: 'JWL-003',
    category: 'Jewellery',
    price: '₹24,999',
    stock: 3,
    variants: ['Gold'],
    sizes: ['One Size'],
    status: 'low_stock',
    image: '📿',
  },
  {
    id: 4,
    name: 'Embroidered Kurti',
    sku: 'KRT-004',
    category: 'Kurtis',
    price: '₹1,299',
    stock: 45,
    variants: ['White', 'Yellow', 'Pink'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    status: 'active',
    image: '👚',
  },
  {
    id: 5,
    name: 'Slim Fit Jeans',
    sku: 'JNS-005',
    category: 'Jeans',
    price: '₹1,899',
    stock: 0,
    variants: ['Blue', 'Black'],
    sizes: ['28', '30', '32', '34', '36'],
    status: 'out_of_stock',
    image: '👖',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All Categories' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
            Manage your products, stock levels, and variants
          </p>
        </div>
        <Button variant="hero">
          <IconPlus className="w-4 h-4" />
          Add Product
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid sm:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <IconPackage className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{products.length}</p>
              <p className="text-sm text-muted-foreground">Total Products</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <IconTrendingUp className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {products.filter(p => p.status === 'active').length}
              </p>
              <p className="text-sm text-muted-foreground">Active Items</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
              <IconAlertTriangle className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {products.filter(p => p.status === 'low_stock').length}
              </p>
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
              <p className="text-2xl font-bold text-foreground">
                {products.filter(p => p.status === 'out_of_stock').length}
              </p>
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
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      {/* Products Table */}
      <motion.div variants={itemVariants} className="bg-card rounded-2xl border border-border overflow-hidden">
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
              {filteredProducts.map((product) => (
                <motion.tr
                  key={product.id}
                  variants={itemVariants}
                  className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-2xl">
                        {product.image}
                      </div>
                      <span className="font-medium text-foreground">{product.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground">{product.sku}</td>
                  <td className="p-4 text-muted-foreground">{product.category}</td>
                  <td className="p-4">
                    <div className="flex gap-1">
                      {product.variants.slice(0, 2).map((variant) => (
                        <span key={variant} className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                          {variant}
                        </span>
                      ))}
                      {product.variants.length > 2 && (
                        <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                          +{product.variants.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 font-medium text-foreground">{product.price}</td>
                  <td className="p-4 text-foreground">{product.stock}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      product.status === 'active' ? 'bg-success/10 text-success' :
                      product.status === 'low_stock' ? 'bg-secondary/10 text-secondary' :
                      'bg-destructive/10 text-destructive'
                    }`}>
                      {product.status === 'active' ? 'In Stock' :
                       product.status === 'low_stock' ? 'Low Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                        <IconEdit className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-destructive/10 transition-colors">
                        <IconTrash className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
