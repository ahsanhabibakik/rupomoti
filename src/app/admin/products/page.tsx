"use client";

import { useState, useEffect, useCallback } from 'react';
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

type Category = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
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
  categoryId: string;
  category: Category;
  createdAt: string;
};

const initialFormData = {
  name: '',
  description: '',
  price: '',
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
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [categoriesForFilter, setCategoriesForFilter] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    categoryId: 'all',
    status: 'all',
    featured: 'all',
  });

  // Form data
  const [formData, setFormData] = useState(initialFormData);

  const [newTag, setNewTag] = useState('');
  const [newImage, setNewImage] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const isFormValid =
    formData.name &&
    formData.description &&
    formData.price &&
    formData.categoryId &&
    formData.sku;

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const searchParams = new URLSearchParams({
        page: '1',
        limit: '50',
      });

      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') {
          searchParams.append(key, value);
        }
      });

      const res = await fetch(`/api/admin/products?${searchParams}`);
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      
      setProducts(data.products || []);
      setCategoriesForFilter(data.filters?.categories || []);
    } catch (err: any) {
      setError(err.message);
      showToast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const fetchAllCategories = async () => {
      try {
        const res = await fetch('/api/admin/categories?all=true');
        if (!res.ok) throw new Error('Failed to fetch categories for form');
        const data = await res.json();
        setAllCategories(data.categories || []);
      } catch (err: any) {
        showToast.error(err.message);
      }
    };
    fetchAllCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = '/api/admin/products';
      const method = editingProduct ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          weight: formData.weight ? parseFloat(formData.weight) : null,
          inStock: formData.isActive,
          ...(editingProduct && { id: editingProduct.id }),
        }),
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
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setNewTag('');
    setNewImage('');
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

  const addImage = () => {
    if (newImage.trim() && !formData.images.includes(newImage.trim())) {
      setFormData({ ...formData, images: [...formData.images, newImage.trim()] });
      setNewImage('');
    }
  };

  const removeImage = (imageToRemove: string) => {
    setFormData({ ...formData, images: formData.images.filter(img => img !== imageToRemove) });
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleFormChange = (
    key: string,
    value: string | boolean | string[],
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSingleImageUpload = async (file: File, fieldToUpdate: keyof typeof formData) => {
    if (!file) return;

    setIsUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('files', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Image upload failed');
      }

      const { urls } = await res.json();
      if (urls && urls.length > 0) {
        handleFormChange(fieldToUpdate as string, urls[0]);
        showToast.success('Image uploaded successfully');
      } else {
        throw new Error('Image URL not returned from server.');
      }
    } catch (err: any) {
      showToast.error(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Image upload failed');
      }

      const { urls } = await res.json();
      setFormData((prev) => ({ ...prev, images: [...prev.images, ...urls] }));
      showToast.success('Images uploaded successfully');
    } catch (err: any) {
      showToast.error(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveAsDraft = async () => {
    if (!formData.name) {
      showToast.error('Product name is required to save a draft.');
      return;
    }

    try {
      const url = '/api/admin/products';
      const method = editingProduct ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price) || 0,
          weight: formData.weight ? parseFloat(formData.weight) : null,
          inStock: false, // Explicitly save as draft
          ...(editingProduct && { id: editingProduct.id }),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save draft');
      }
      
      showToast.success('Product saved as draft');
      setIsDialogOpen(false);
      setEditingProduct(null);
      resetForm();
      fetchProducts();
    } catch (err: any) {
      showToast.error(err.message);
    }
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

      <Tabs value={filters.status} onValueChange={(value) => handleFilterChange('status', value)} className="space-y-4">
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
            <div className="flex flex-col md:flex-row gap-4 mb-4">
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
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categoriesForFilter.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
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
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="true">Featured</SelectItem>
                      <SelectItem value="false">Not Featured</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </CardContent>
          <div className="px-6 pb-6 pt-0">
            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 sm:w-auto">
              <TabsTrigger value="all">All Products</TabsTrigger>
              <TabsTrigger value="active">Published</TabsTrigger>
              <TabsTrigger value="inactive">Drafts</TabsTrigger>
            </TabsList>
          </div>
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
                              fill
                              className="object-cover"
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
                          {product.inStock ? 'Published' : 'Draft'}
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
      </Tabs>

      {/* Dialog for Add/Edit Product */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setEditingProduct(null);
            resetForm();
          }
          setIsDialogOpen(open);
        }}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <ScrollArea className="max-h-[70vh] p-4">
              <Tabs defaultValue="general" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="media">Media</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="seo">SEO</TabsTrigger>
                </TabsList>
                <TabsContent value="general">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Product Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleFormChange('name', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sku">SKU *</Label>
                      <Input
                        id="sku"
                        value={formData.sku}
                        onChange={(e) => handleFormChange('sku', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">Price *</Label>
                      <Input
                        id="price"
                        type="number"
                        value={formData.price}
                        onChange={(e) => handleFormChange('price', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={formData.categoryId}
                        onValueChange={(value) =>
                          handleFormChange('categoryId', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {allCategories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-full space-y-2">
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                          handleFormChange('description', e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isActive"
                        checked={formData.isActive}
                        onCheckedChange={(checked) =>
                          handleFormChange('isActive', checked)
                        }
                      />
                      <Label htmlFor="isActive">Publish Product</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="featured"
                        checked={formData.featured}
                        onCheckedChange={(checked) =>
                          handleFormChange('featured', checked)
                        }
                      />
                      <Label htmlFor="featured">Featured</Label>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="media">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-lg font-medium">Main Image</Label>
                      <div className="p-4 border rounded-lg space-y-4 bg-muted/20">
                        <div className="space-y-2">
                          <Label htmlFor="mainImage">Main Image URL</Label>
                          <Input
                            id="mainImage"
                            placeholder="https://example.com/image.png"
                            value={formData.mainImage}
                            onChange={(e) =>
                              handleFormChange('mainImage', e.target.value)
                            }
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-grow border-t"></div>
                          <span className="text-xs text-muted-foreground">OR</span>
                          <div className="flex-grow border-t"></div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="main-image-upload">Upload from Device</Label>
                          <Input
                            id="main-image-upload"
                            type="file"
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                handleSingleImageUpload(e.target.files[0], 'mainImage');
                              }
                            }}
                            disabled={isUploading}
                          />
                        </div>
                        {formData.mainImage && (
                          <div className="w-32 h-32 relative rounded-md overflow-hidden">
                            <Image
                              src={formData.mainImage}
                              alt="Main image preview"
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-lg font-medium">Additional Images</Label>
                      <div className="p-4 border rounded-lg space-y-4 bg-muted/20">
                        <div className="space-y-2">
                          <Label htmlFor="newImage">Add by URL</Label>
                          <div className="flex gap-2">
                            <Input
                              id="newImage"
                              placeholder="https://example.com/image.png"
                              value={newImage}
                              onChange={(e) => setNewImage(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  addImage();
                                }
                              }}
                            />
                            <Button type="button" onClick={addImage}>
                              Add URL
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex-grow border-t"></div>
                          <span className="text-xs text-muted-foreground">OR</span>
                          <div className="flex-grow border-t"></div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="image-upload">Upload from Device</Label>
                          <Input
                            id="image-upload"
                            type="file"
                            multiple
                            onChange={handleImageUpload}
                            disabled={isUploading}
                          />
                        </div>
                        
                        {isUploading && <p className="text-sm text-muted-foreground">Uploading images...</p>}

                        {formData.images.length > 0 && (
                          <div className="space-y-2">
                            <Label>Image Previews</Label>
                            <div className="flex flex-wrap gap-2 pt-2">
                              {formData.images.map((img) => (
                                <div key={img} className="relative w-24 h-24">
                                  <Image
                                    src={img}
                                    alt="Additional image"
                                    fill
                                    className="object-cover rounded-md"
                                  />
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-1 right-1 h-6 w-6"
                                    onClick={() => removeImage(img)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="details">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="brand">Brand</Label>
                      <Input
                        id="brand"
                        value={formData.brand}
                        onChange={(e) => handleFormChange('brand', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="material">Material</Label>
                      <Input
                        id="material"
                        value={formData.material}
                        onChange={(e) =>
                          handleFormChange('material', e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="color">Color</Label>
                      <Input
                        id="color"
                        value={formData.color}
                        onChange={(e) => handleFormChange('color', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="weight">Weight (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        value={formData.weight}
                        onChange={(e) =>
                          handleFormChange('weight', e.target.value)
                        }
                      />
                    </div>
                    <div className="col-span-full space-y-2">
                      <Label htmlFor="dimensions">Dimensions</Label>
                      <Input
                        id="dimensions"
                        placeholder="e.g., 10cm x 5cm x 2cm"
                        value={formData.dimensions}
                        onChange={(e) =>
                          handleFormChange('dimensions', e.target.value)
                        }
                      />
                    </div>
                    <div className="col-span-full space-y-2">
                      <Label>Tags</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a tag"
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                        />
                        <Button type="button" onClick={addTag}>
                          Add Tag
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                            <button
                              type="button"
                              className="ml-2"
                              onClick={() => removeTag(tag)}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="seo">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="metaTitle">Meta Title</Label>
                      <Input
                        id="metaTitle"
                        value={formData.metaTitle}
                        onChange={(e) =>
                          handleFormChange('metaTitle', e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="metaDescription">Meta Description</Label>
                      <Textarea
                        id="metaDescription"
                        value={formData.metaDescription}
                        onChange={(e) =>
                          handleFormChange('metaDescription', e.target.value)
                        }
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </ScrollArea>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleSaveAsDraft}
                disabled={!formData.name}
              >
                Save as Draft
              </Button>
              <Button type="submit" disabled={!isFormValid}>
                {editingProduct ? 'Update Product' : 'Publish Product'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 