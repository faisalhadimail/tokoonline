'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Package,
  Filter,
  Eye,
  ImageOff,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatRupiah, truncate, slugify } from '@/lib/helpers';
import type { Product, Category } from '@/lib/types';
import { toast } from 'sonner';

interface ProductFormData {
  name: string;
  description: string;
  shortDesc: string;
  price: number;
  comparePrice: number;
  sku: string;
  weight: number;
  stock: number;
  minStock: number;
  imageUrl: string;
  images: string;
  categoryIds: string[];
  isActive: boolean;
  isFeatured: boolean;
  isPreorder: boolean;
}

const defaultFormData: ProductFormData = {
  name: '',
  description: '',
  shortDesc: '',
  price: 0,
  comparePrice: 0,
  sku: '',
  weight: 0,
  stock: 0,
  minStock: 5,
  imageUrl: '',
  images: '',
  categoryIds: [],
  isActive: true,
  isFeatured: false,
  isPreorder: false,
};

export default function ProductManager() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(defaultFormData);
  const [inlineStock, setInlineStock] = useState<Record<string, string>>({});

  // Fetch products
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ['admin-products', search, statusFilter],
    queryFn: () =>
      fetch(
        `/api/products?admin=true&search=${search}&status=${statusFilter}&limit=100`
      ).then((r) => r.json()),
  });

  // Fetch categories
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['admin-categories'],
    queryFn: () => fetch('/api/categories').then((r) => r.json()),
  });

  // Create product mutation
  const createMutation = useMutation({
    mutationFn: (data: ProductFormData) =>
      fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      setAddDialogOpen(false);
      setFormData(defaultFormData);
      toast.success('Product created successfully');
    },
    onError: () => toast.error('Failed to create product'),
  });

  // Update product mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProductFormData }) =>
      fetch(`/api/products?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      setEditDialogOpen(false);
      setSelectedProduct(null);
      setFormData(defaultFormData);
      toast.success('Product updated successfully');
    },
    onError: () => toast.error('Failed to update product'),
  });

  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/products?id=${id}`, { method: 'DELETE' }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      setDeleteDialogOpen(false);
      setSelectedProduct(null);
      toast.success('Product deleted successfully');
    },
    onError: () => toast.error('Failed to delete product'),
  });

  // Update stock mutation
  const updateStockMutation = useMutation({
    mutationFn: ({ id, stock }: { id: string; stock: number }) =>
      fetch(`/api/products?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock }),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Stock updated');
    },
    onError: () => toast.error('Failed to update stock'),
  });

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      shortDesc: product.shortDesc || '',
      price: product.price,
      comparePrice: product.comparePrice || 0,
      sku: product.sku,
      weight: product.weight,
      stock: product.stock,
      minStock: product.minStock,
      imageUrl: Array.isArray(product.images) ? product.images[0] || '' : product.images,
      images: Array.isArray(product.images) ? product.images.join(', ') : product.images,
      categoryIds: product.categories?.map((c) => c.category.id) || [],
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      isPreorder: product.isPreorder,
    });
    setEditDialogOpen(true);
  };

  const handleDelete = (product: Product) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };

  const handleInlineStockSave = (productId: string) => {
    const val = parseInt(inlineStock[productId]);
    if (isNaN(val) || val < 0) return;
    updateStockMutation.mutate({ id: productId, stock: val });
    setInlineStock((prev) => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
  };

  const getProductImage = (product: Product) => {
    try {
      const imgs = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
      if (Array.isArray(imgs) && imgs.length > 0) return imgs[0];
    } catch {
      // ignore
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Products</h3>
          <p className="text-sm text-gray-500">
            {products?.length || 0} products total
          </p>
        </div>
        <Button
          className="bg-rose-500 hover:bg-rose-600 text-white"
          onClick={() => {
            setFormData(defaultFormData);
            setAddDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Product
        </Button>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="pt-0 pb-0">
          <div className="flex flex-col sm:flex-row gap-3 p-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search products by name or SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <Filter className="h-4 w-4 mr-1 text-gray-400" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="preorder">Preorder</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead className="w-12">Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="w-24">SKU</TableHead>
                  <TableHead className="w-28 text-right">Price</TableHead>
                  <TableHead className="w-24 text-center">Stock</TableHead>
                  <TableHead className="w-28 text-center">Status</TableHead>
                  <TableHead className="w-16">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading
                  ? Array.from({ length: 8 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Skeleton className="h-10 w-10 rounded-lg" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-32" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-16" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-20 ml-auto" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-10 mx-auto" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-16 mx-auto rounded-full" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-8 w-8 mx-auto" />
                        </TableCell>
                      </TableRow>
                    ))
                  : products && products.length > 0 ? (
                      products.map((product) => {
                        const img = getProductImage(product);
                        const isLowStock = product.stock <= product.minStock;
                        return (
                          <TableRow key={product.id}>
                            <TableCell>
                              <div className="h-10 w-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                                {img ? (
                                  <img
                                    src={img}
                                    alt={product.name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <ImageOff className="h-4 w-4 text-gray-300 m-auto mt-[10px]" />
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                                {product.name}
                              </p>
                              <div className="flex gap-1 mt-1">
                                {product.isFeatured && (
                                  <Badge className="text-[9px] px-1 py-0 bg-amber-100 text-amber-700 border-0">
                                    Featured
                                  </Badge>
                                )}
                                {product.isPreorder && (
                                  <Badge className="text-[9px] px-1 py-0 bg-purple-100 text-purple-700 border-0">
                                    Preorder
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-xs text-gray-500 font-mono">
                                {product.sku}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <p className="text-sm font-medium text-gray-900">
                                {formatRupiah(product.price)}
                              </p>
                              {product.comparePrice && product.comparePrice > product.price && (
                                <p className="text-xs text-gray-400 line-through">
                                  {formatRupiah(product.comparePrice)}
                                </p>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {inlineStock[product.id] !== undefined ? (
                                <div className="flex items-center justify-center gap-1">
                                  <Input
                                    type="number"
                                    min={0}
                                    value={inlineStock[product.id]}
                                    onChange={(e) =>
                                      setInlineStock((prev) => ({
                                        ...prev,
                                        [product.id]: e.target.value,
                                      }))
                                    }
                                    className="w-16 h-7 text-xs text-center"
                                    autoFocus
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter')
                                        handleInlineStockSave(product.id);
                                      if (e.key === 'Escape')
                                        setInlineStock((prev) => {
                                          const next = { ...prev };
                                          delete next[product.id];
                                          return next;
                                        });
                                    }}
                                    onBlur={() => handleInlineStockSave(product.id)}
                                  />
                                </div>
                              ) : (
                                <button
                                  onClick={() =>
                                    setInlineStock((prev) => ({
                                      ...prev,
                                      [product.id]: String(product.stock),
                                    }))
                                  }
                                  className={`text-sm font-medium cursor-pointer hover:underline ${
                                    isLowStock ? 'text-red-500' : 'text-gray-700'
                                  }`}
                                >
                                  {product.stock}
                                </button>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center gap-1">
                                <Badge
                                  variant="secondary"
                                  className={`text-[10px] px-1.5 py-0 ${
                                    product.isActive
                                      ? 'bg-emerald-100 text-emerald-700'
                                      : 'bg-gray-100 text-gray-600'
                                  }`}
                                >
                                  {product.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                                {isLowStock && (
                                  <Badge
                                    variant="destructive"
                                    className="text-[9px] px-1 py-0"
                                  >
                                    Low
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEdit(product)}>
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDelete(product)}
                                    className="text-red-600 focus:text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12">
                          <Package className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500 font-medium">No products found</p>
                          <p className="text-gray-400 text-sm">
                            Try adjusting your search or filter
                          </p>
                        </TableCell>
                      </TableRow>
                    )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Product Dialog */}
      <ProductFormDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        formData={formData}
        setFormData={setFormData}
        categories={categories || []}
        onSubmit={() => createMutation.mutate(formData)}
        loading={createMutation.isPending}
        title="Add New Product"
      />

      {/* Edit Product Dialog */}
      <ProductFormDialog
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) setSelectedProduct(null);
        }}
        formData={formData}
        setFormData={setFormData}
        categories={categories || []}
        onSubmit={() => {
          if (selectedProduct) {
            updateMutation.mutate({ id: selectedProduct.id, data: formData });
          }
        }}
        loading={updateMutation.isPending}
        title="Edit Product"
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <span className="font-semibold text-gray-900">
                {selectedProduct?.name}
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setSelectedProduct(null)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={() => {
                if (selectedProduct) deleteMutation.mutate(selectedProduct.id);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Shared product form dialog
interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: ProductFormData;
  setFormData: (data: ProductFormData) => void;
  categories: Category[];
  onSubmit: () => void;
  loading: boolean;
  title: string;
}

function ProductFormDialog({
  open,
  onOpenChange,
  formData,
  setFormData,
  categories,
  onSubmit,
  loading,
  title,
}: ProductFormDialogProps) {
  const updateField = <K extends keyof ProductFormData>(
    field: K,
    value: ProductFormData[K]
  ) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Fill in the product details below.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {/* Name */}
          <div className="grid gap-2">
            <Label htmlFor="prod-name">Product Name *</Label>
            <Input
              id="prod-name"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="e.g., Casual Linen Shirt"
            />
          </div>

          {/* Slug hint */}
          {formData.name && (
            <p className="text-xs text-gray-400 -mt-1">
              Slug: {slugify(formData.name)}
            </p>
          )}

          {/* Description */}
          <div className="grid gap-2">
            <Label htmlFor="prod-desc">Description *</Label>
            <Textarea
              id="prod-desc"
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Product description..."
              rows={3}
            />
          </div>

          {/* Short Desc */}
          <div className="grid gap-2">
            <Label htmlFor="prod-shortdesc">Short Description</Label>
            <Input
              id="prod-shortdesc"
              value={formData.shortDesc}
              onChange={(e) => updateField('shortDesc', e.target.value)}
              placeholder="Brief product description"
            />
          </div>

          {/* Price + Compare Price */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="prod-price">Price (Rp) *</Label>
              <Input
                id="prod-price"
                type="number"
                min={0}
                value={formData.price}
                onChange={(e) => updateField('price', Number(e.target.value))}
                placeholder="0"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="prod-compare">Compare Price (Rp)</Label>
              <Input
                id="prod-compare"
                type="number"
                min={0}
                value={formData.comparePrice}
                onChange={(e) => updateField('comparePrice', Number(e.target.value))}
                placeholder="0"
              />
            </div>
          </div>

          {/* SKU + Weight */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="prod-sku">SKU *</Label>
              <Input
                id="prod-sku"
                value={formData.sku}
                onChange={(e) => updateField('sku', e.target.value)}
                placeholder="e.g., LXE-SH-001"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="prod-weight">Weight (gram)</Label>
              <Input
                id="prod-weight"
                type="number"
                min={0}
                value={formData.weight}
                onChange={(e) => updateField('weight', Number(e.target.value))}
                placeholder="0"
              />
            </div>
          </div>

          {/* Stock + Min Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="prod-stock">Stock *</Label>
              <Input
                id="prod-stock"
                type="number"
                min={0}
                value={formData.stock}
                onChange={(e) => updateField('stock', Number(e.target.value))}
                placeholder="0"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="prod-minstock">Min Stock Alert</Label>
              <Input
                id="prod-minstock"
                type="number"
                min={0}
                value={formData.minStock}
                onChange={(e) => updateField('minStock', Number(e.target.value))}
                placeholder="5"
              />
            </div>
          </div>

          {/* Image URL */}
          <div className="grid gap-2">
            <Label htmlFor="prod-image">Image URL</Label>
            <Input
              id="prod-image"
              value={formData.imageUrl}
              onChange={(e) => {
                updateField('imageUrl', e.target.value);
                updateField(
                  'images',
                  e.target.value ? `[${e.target.value}]` : ''
                );
              }}
              placeholder="https://example.com/image.jpg"
            />
            <p className="text-xs text-gray-400">
              Enter image URL. Multiple images: separate with commas.
            </p>
            <Input
              value={formData.images.replace(/^\[|\]$/g, '').replace(/"/g, '')}
              onChange={(e) => {
                const val = e.target.value;
                const arr = val
                  .split(',')
                  .map((s) => s.trim().replace(/^"|"$/g, ''))
                  .filter(Boolean);
                updateField('images', JSON.stringify(arr));
                updateField('imageUrl', arr[0] || '');
              }}
              placeholder="image1.jpg, image2.jpg, image3.jpg"
            />
          </div>

          {/* Category */}
          <div className="grid gap-2">
            <Label>Category</Label>
            <Select
              value={formData.categoryIds[0] || ''}
              onValueChange={(val) => updateField('categoryIds', [val])}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Toggles */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="prod-active">Active</Label>
              <Switch
                id="prod-active"
                checked={formData.isActive}
                onCheckedChange={(checked) => updateField('isActive', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="prod-featured">Featured</Label>
              <Switch
                id="prod-featured"
                checked={formData.isFeatured}
                onCheckedChange={(checked) => updateField('isFeatured', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="prod-preorder">Preorder</Label>
              <Switch
                id="prod-preorder"
                checked={formData.isPreorder}
                onCheckedChange={(checked) => updateField('isPreorder', checked)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="bg-rose-500 hover:bg-rose-600 text-white"
            onClick={onSubmit}
            disabled={loading || !formData.name || !formData.sku}
          >
            {loading ? 'Saving...' : title.includes('Add') ? 'Create Product' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
