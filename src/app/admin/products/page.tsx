"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Star,
  Image as ImageIcon,
  X
} from 'lucide-react';
import Image from 'next/image';
import { showToast } from '@/lib/toast';
import { uploadImage } from '@/lib/cloudinary';

type Category = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  mainImage: string;
  images: string[];
  sku: string;
  weight?: number;
  dimensions?: string;
  material?: string;
  color?: string;
  brand?: string;
  tags: string[];
  metaTitle?: string;
  metaDescription?: string;
  inStock: boolean;
  featured: boolean;
  status?: 'DRAFT' | 'PUBLISHED';
  categoryId: string;
  category: Category;
  createdAt: string;
};

const PRODUCT_LABELS = [
  { value: 'NONE', label: 'None' },
  { value: 'NEW_ARRIVAL', label: 'New Arrival' },
  { value: 'BEST_SELLER', label: 'Best Seller' },
  { value: 'POPULAR', label: 'Popular' },
  { value: 'FEATURED', label: 'Featured' }
];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const additionalImagesRef = useRef<HTMLInputElement>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    categoryId: '',
    status: '',
    featured: '',
  });

  // Add this effect to load categories
useEffect(() => {
  const loadCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  loadCategories();
}, []);

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    salePrice: '',
    categoryId: '',
    mainImage: '',
    images: [] as string[],
    sku: '',
    weight: '',
    dimensions: '',
    material: '',
    color: '',
    brand: '',
    tags: [] as string[],
    metaTitle: '',
    metaDescription: '',
    isActive: true,
    featured: false,
    productLabel: 'NONE',
    status: 'PUBLISHED' as 'DRAFT' | 'PUBLISHED',
  });

  // Calculate discount percentage
  const calculateDiscount = () => {
    if (!formData.salePrice || !formData.price) return 0;
    const price = parseFloat(formData.price);
    const salePrice = parseFloat(formData.salePrice);
    if (price <= 0 || salePrice >= price) return 0;
    return Math.round(((price - salePrice) / price) * 100);
  };

  const discountPercentage = calculateDiscount();

  const [newTag, setNewTag] = useState('');

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const searchParams = new URLSearchParams({
        page: '1',
        limit: '50',
        ...filters,
      });

      const res = await fetch(`/api/admin/products?${searchParams}`);
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      
      setProducts(data.products || []);
      setCategories(data.filters?.categories || []);
    } catch (err: any) {
      setError(err.message);
      showToast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSubmit = async (e: React.FormEvent | any, isDraft: boolean = false) => {
    if (e && e.preventDefault) e.preventDefault();
    
    try {
      const url = '/api/admin/products';
      const method = editingProduct ? 'PUT' : 'POST';
      
      // If we're getting form data directly (from Save as Draft), use it
      const formDataToSubmit = e && typeof e === 'object' && !e.preventDefault 
        ? { ...e, status: isDraft ? 'DRAFT' : 'PUBLISHED' } 
        : { ...formData, status: isDraft ? 'DRAFT' : 'PUBLISHED' };
      
      const payload = {
        ...formDataToSubmit,
        price: parseFloat(formDataToSubmit.price),
        salePrice: formDataToSubmit.salePrice ? parseFloat(formDataToSubmit.salePrice) : null,
        weight: formDataToSubmit.weight ? parseFloat(formDataToSubmit.weight) : null,
        ...(editingProduct && { id: editingProduct.id }),
      };
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save product');
      }
      
      showToast.success(editingProduct ? 'Product updated successfully' : 'Product created successfully');
      setIsDialogOpen(false);
      setEditingProduct(null);
      resetForm();
      fetchProducts();
    } catch (err: any) {
      showToast.error(err.message);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const res = await fetch(`/api/admin/products?id=${productId}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) throw new Error('Failed to delete product');
      
      showToast.success('Product deleted successfully');
      fetchProducts();
    } catch (err: any) {
      showToast.error(err.message);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      salePrice: product.salePrice?.toString() || '',
      categoryId: product.categoryId,
      mainImage: product.mainImage,
      images: product.images.filter(img => img !== product.mainImage),
      sku: product.sku,
      weight: product.weight?.toString() || '',
      dimensions: product.dimensions || '',
      material: product.material || '',
      color: product.color || '',
      brand: product.brand || '',
      tags: product.tags || [],
      metaTitle: product.metaTitle || '',
      metaDescription: product.metaDescription || '',
      isActive: product.inStock,
      featured: product.featured,
      status: product.status || 'PUBLISHED',
      productLabel: 'NONE',
    });
    setIsDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isMainImage = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast.error('Image size should be less than 5MB');
      return;
    }

    try {
      setIsUploading(true);
      const result = await uploadImage(file);
      
      if (isMainImage) {
        setFormData(prev => ({
          ...prev,
          mainImage: result.url
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, result.url]
        }));
      }
      
      showToast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      showToast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
      // Reset the file input
      if (e.target) e.target.value = '';
    }
  };

  const removeImage = (url: string, isMainImage = false) => {
    if (isMainImage) {
      setFormData(prev => ({
        ...prev,
        mainImage: ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter(img => img !== url)
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      salePrice: '',
      categoryId: '',
      mainImage: '',
      images: [],
      sku: '',
      weight: '',
      dimensions: '',
      material: '',
      color: '',
      brand: '',
      tags: [],
      metaTitle: '',
      metaDescription: '',
      isActive: true,
      featured: false,
      status: 'PUBLISHED',
      productLabel: 'NONE',
    });
    setNewTag('');
  };

  const openAddDialog = () => {
    setEditingProduct(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, newTag.trim()] });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(tag => tag !== tagToRemove) });
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">
            Manage your product catalog ({products.length} products)
          </p>
        </div>
        <Button onClick={openAddDialog} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add New Product
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Search
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'Hide' : 'Show'} Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products by name, description, or SKU..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={filters.categoryId}
              onValueChange={(value) => handleFilterChange('categoryId', value)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-categories">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange('status', value)}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-status">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t">
              <div>
                <Label>Featured</Label>
                <Select
                  value={filters.featured}
                  onValueChange={(value) => handleFilterChange('featured', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-featured">All</SelectItem>
                    <SelectItem value="true">Featured</SelectItem>
                    <SelectItem value="false">Not Featured</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Products Table */}
      {error ? (
        <div className="text-destructive text-center py-8">{error}</div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length > 0 ? (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 relative rounded-lg overflow-hidden">
                          <Image
                            src={product.mainImage || '/placeholder.png'}
                            alt={product.name}
                            width={48}
                            height={48}
                            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                          />
                        </div>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {product.description.substring(0, 50)}...
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                    <TableCell>{product.category?.name || 'Uncategorized'}</TableCell>
                    <TableCell>৳{product.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={product.inStock ? 'default' : 'secondary'}>
                        {product.inStock ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {product.featured && (
                        <Badge variant="outline" className="text-yellow-600">
                          <Star className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No products found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Product Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-120px)]">
            <form onSubmit={handleSubmit} className="space-y-6 p-1">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="images">Images</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="seo">SEO</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Product Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="sku">SKU</Label>
                      <Input
                        id="sku"
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        placeholder="Auto-generated if empty"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="price">Regular Price *</Label>
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="salePrice">Sale Price</Label>
                      <Input
                        id="salePrice"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.salePrice}
                        onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                        className={formData.salePrice && parseFloat(formData.salePrice) >= parseFloat(formData.price || '0') ? 'border-red-500' : ''}
                      />
                      {formData.salePrice && parseFloat(formData.salePrice) >= parseFloat(formData.price || '0') && (
                        <p className="text-xs text-red-500 mt-1">Sale price must be less than regular price</p>
                      )}
                    </div>
                    <div>
                      <Label>Discount</Label>
                      <div className="h-10 flex items-center px-3 rounded-md border border-input bg-background text-sm">
                        {discountPercentage > 0 ? (
                          <span className="text-green-600 font-medium">{discountPercentage}% OFF</span>
                        ) : (
                          <span className="text-muted-foreground">No discount</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={formData.categoryId}
                        onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="weight">Weight (g)</Label>
                      <Input
                        id="weight"
                        type="number"
                        step="0.1"
                        min="0"
                        value={formData.weight}
                        onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isActive"
                        checked={formData.isActive}
                        onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                      />
                      <Label htmlFor="isActive">Active</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="featured"
                        checked={formData.featured}
                        onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                      />
                      <Label htmlFor="featured">Featured</Label>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="images" className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label>Main Image *</Label>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) => handleImageUpload(e, true)}
                        accept="image/*"
                        className="hidden"
                        disabled={isUploading}
                      />
                      <div className="mt-2 flex items-center gap-4">
                        {formData.mainImage ? (
                          <div className="relative group">
                            <Image
                              src={formData.mainImage}
                              alt="Main product"
                              width={128}
                              height={128}
                              className="rounded-md border"
                              style={{ objectFit: 'cover' }}
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(formData.mainImage, true)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              disabled={isUploading}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div 
                            className="h-32 w-32 border-2 border-dashed rounded-md flex items-center justify-center cursor-pointer hover:border-primary transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            {isUploading ? (
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                            ) : (
                              <div className="text-center p-2">
                                <ImageIcon className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
                                <span className="text-xs text-muted-foreground">Upload Main Image</span>
                              </div>
                            )}
                          </div>
                        )}
                        <div className="text-sm text-muted-foreground">
                          <p>Recommended size: 800x800px</p>
                          <p>Max file size: 5MB</p>
                          <p>Formats: JPG, PNG, WEBP</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Additional Images (up to {9 - formData.images.length} remaining)</Label>
                      <input
                        type="file"
                        ref={additionalImagesRef}
                        onChange={(e) => handleImageUpload(e, false)}
                        accept="image/*"
                        className="hidden"
                        disabled={isUploading || formData.images.length >= 9}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => additionalImagesRef.current?.click()}
                        disabled={isUploading || formData.images.length >= 9}
                        className="mt-2"
                      >
                        <ImageIcon className="h-4 w-4 mr-2" />
                        {isUploading ? 'Uploading...' : 'Add Additional Images'}
                      </Button>
                      {formData.images.length >= 9 && (
                        <p className="text-xs text-muted-foreground mt-1">Maximum 9 additional images reached</p>
                      )}
                    </div>

                    {formData.images.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {formData.images.map((image, index) => (
                          <div key={index} className="relative group">
                            <Image
                              src={image}
                              alt={`Product ${index + 1}`}
                              width={128}
                              height={128}
                              className="rounded-md border"
                              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(image)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              disabled={isUploading}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="material">Material</Label>
                      <Input
                        id="material"
                        value={formData.material}
                        onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="color">Color</Label>
                      <Input
                        id="color"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="brand">Brand</Label>
                      <Input
                        id="brand"
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="dimensions">Dimensions</Label>
                      <Input
                        id="dimensions"
                        value={formData.dimensions}
                        onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                        placeholder="LxWxH cm"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Tags</Label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          placeholder="Add a tag"
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        />
                        <Button type="button" onClick={addTag}>
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="gap-1">
                            {tag}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => removeTag(tag)}
                            />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="seo" className="space-y-4">
                  <div>
                    <Label htmlFor="metaTitle">Meta Title</Label>
                    <Input
                      id="metaTitle"
                      value={formData.metaTitle}
                      onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                      placeholder="SEO title for search engines"
                    />
                  </div>
                  <div>
                    <Label htmlFor="metaDescription">Meta Description</Label>
                    <Textarea
                      id="metaDescription"
                      value={formData.metaDescription}
                      onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                      placeholder="SEO description for search engines"
                      rows={3}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <Separator />

              <div className="flex justify-between items-center mt-6">
  <div className="text-sm text-muted-foreground">
    {formData.status === 'DRAFT' && (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        Draft
      </span>
    )}
  </div>
  <div className="flex gap-2">
    <Button
      type="button"
      variant="outline"
      onClick={() => setIsDialogOpen(false)}
    >
      Cancel
    </Button>
    <Button
      type="button"
      variant="outline"
      onClick={() => handleSubmit(null, true)}
      disabled={!formData.name || !formData.price || !formData.categoryId}
    >
      Save as Draft
    </Button>
    <Button
      type="button"
      onClick={() => handleSubmit(null, false)}
      disabled={!formData.name || !formData.price || !formData.categoryId || !formData.mainImage}
    >
      {editingProduct ? 'Update Product' : 'Publish Product'}
    </Button>
  </div>
</div>
              
            </form>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
} 