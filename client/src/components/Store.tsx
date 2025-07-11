import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShoppingCart, Package, Search, AlertTriangle, TrendingUp, BarChart3, DollarSign } from "lucide-react";

interface Product {
  id: number;
  sku: string;
  name: string;
  description?: string;
  category: string;
  price: string;
  cost?: string;
  warehouseStock: number;
  storeStock: number;
  minStockLevel: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const categories = [
  "Electronics",
  "Clothing", 
  "Home & Garden",
  "Sports & Outdoors",
  "Books",
  "Automotive",
  "Health & Beauty",
  "Toys & Games",
  "Office Supplies",
  "Food & Beverages",
  "Tools & Hardware",
  "Pet Supplies",
  "Music & Movies",
  "Art & Crafts",
  "Other"
];

export default function Store() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<string>("all");

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const filteredProducts = products?.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    const matchesStock = stockFilter === "all" || 
                        (stockFilter === "low" && product.storeStock < product.minStockLevel) ||
                        (stockFilter === "out" && product.storeStock === 0);
    
    return matchesSearch && matchesCategory && matchesStock;
  });

  const storeStats = products ? {
    totalProducts: products.filter(p => p.storeStock > 0).length,
    totalStock: products.reduce((sum, p) => sum + p.storeStock, 0),
    lowStockCount: products.filter(p => p.storeStock > 0 && p.storeStock < p.minStockLevel).length,
    outOfStockCount: products.filter(p => p.storeStock === 0).length,
    totalValue: products.reduce((sum, p) => sum + (p.storeStock * parseFloat(p.price)), 0),
  } : null;

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Store Management</h1>
          <p className="text-muted-foreground">
            Manage retail inventory and track store sales
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {storeStats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{storeStats.totalProducts}</div>
              <p className="text-xs text-muted-foreground">Products in stock</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{storeStats.totalStock}</div>
              <p className="text-xs text-muted-foreground">Units in store</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{storeStats.totalValue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Total retail value</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{storeStats.lowStockCount}</div>
              <p className="text-xs text-muted-foreground">Items below minimum</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
              <TrendingUp className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{storeStats.outOfStockCount}</div>
              <p className="text-xs text-muted-foreground">Items depleted</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-6">
        {/* Store Inventory */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Store Inventory</CardTitle>
              <CardDescription>
                Products currently available in store
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex gap-4 flex-wrap mb-6">
                <div className="flex-1 min-w-[200px]">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="stock">Stock Level</Label>
                  <Select value={stockFilter} onValueChange={setStockFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select stock level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Stock Levels</SelectItem>
                      <SelectItem value="low">Low Stock</SelectItem>
                      <SelectItem value="out">Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : filteredProducts && filteredProducts.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Store Stock</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.map((product) => {
                        const isLowStock = product.storeStock > 0 && product.storeStock < product.minStockLevel;
                        const isOutOfStock = product.storeStock === 0;
                        
                        return (
                          <TableRow key={product.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{product.name}</div>
                                {product.description && (
                                  <div className="text-sm text-muted-foreground">{product.description}</div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{product.category}</TableCell>
                            <TableCell>{product.price}</TableCell>
                            <TableCell>
                              <Badge 
                                variant={isOutOfStock ? "destructive" : isLowStock ? "secondary" : "default"}
                              >
                                {product.storeStock} units
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={
                                isOutOfStock ? "destructive" : 
                                isLowStock ? "secondary" : 
                                "default"
                              }>
                                {isOutOfStock ? "Out of Stock" : isLowStock ? "Low Stock" : "In Stock"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm || selectedCategory !== "all" || stockFilter !== "all" 
                      ? "Try adjusting your search or filters"
                      : "No products available in store"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>


      </div>
    </div>
  );
}