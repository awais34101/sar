import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowRightLeft, Plus, Edit, Trash2, Search, Package, Building2, ShoppingCart, User, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { z } from "zod";

interface Transfer {
  id: number;
  transferNumber: string;
  productId: number;
  fromLocation: string;
  toLocation: string;
  quantity: number;
  status: string;
  requestedBy: number;
  approvedBy?: number;
  technicianName: string;
  activityType: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  product?: {
    id: number;
    name: string;
    sku: string;
    warehouseStock: number;
    storeStock: number;
  };
  requester?: {
    id: number;
    username: string;
  };
  approver?: {
    id: number;
    username: string;
  };
}

interface Product {
  id: number;
  sku: string;
  name: string;
  warehouseStock: number;
  storeStock: number;
}

interface User {
  id: number;
  username: string;
  name: string;
}

interface Technician {
  id: number;
  employeeId: string;
  name: string;
  email?: string;
  phone: string;
  specialization?: string;
  status: string;
  hireDate: string;
  createdAt: string;
  updatedAt: string;
}

const transferSchema = z.object({
  transferNumber: z.string().min(1, "Transfer number is required"),
  productId: z.number().min(1, "Product is required"),
  fromLocation: z.enum(["warehouse", "store"]),
  toLocation: z.enum(["warehouse", "store"]),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  technicianName: z.string().min(1, "Technician name is required"),
  activityType: z.enum(["check", "repair"]),
  notes: z.string().optional(),
});

type TransferFormData = z.infer<typeof transferSchema>;

function generateTransferNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `TRF-${year}${month}${day}-${random}`;
}

function TransferForm({ transfer, onSuccess }: { transfer?: Transfer; onSuccess: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [productOpen, setProductOpen] = useState(false);

  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: technicians } = useQuery<Technician[]>({
    queryKey: ["/api/technicians"],
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  const form = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      transferNumber: transfer?.transferNumber || generateTransferNumber(),
      productId: transfer?.productId || 0,
      fromLocation: transfer?.fromLocation as "warehouse" | "store" || "warehouse",
      toLocation: transfer?.toLocation as "warehouse" | "store" || "store",
      quantity: transfer?.quantity || 0,
      technicianName: transfer?.technicianName || "",
      activityType: transfer?.activityType as "check" | "repair" || "check",
      notes: transfer?.notes || "",
    },
  });

  const watchedProductId = form.watch("productId");
  const watchedFromLocation = form.watch("fromLocation");
  const selectedProduct = products?.find(p => p.id === watchedProductId);
  const availableStock = selectedProduct ? 
    (watchedFromLocation === "warehouse" ? selectedProduct.warehouseStock : selectedProduct.storeStock) : 0;

  const createMutation = useMutation({
    mutationFn: (data: TransferFormData) => 
      apiRequest("POST", `/api/transfers`, {
        ...data,
        requestedBy: user?.id,
        status: "completed", // Immediate completion
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transfers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Transfer completed successfully",
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to complete transfer",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: TransferFormData) =>
      apiRequest("PATCH", `/api/transfers/${transfer?.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transfers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Transfer updated successfully",
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update transfer",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TransferFormData) => {
    if (data.fromLocation === data.toLocation) {
      toast({
        title: "Error",
        description: "From and To locations cannot be the same",
        variant: "destructive",
      });
      return;
    }

    if (transfer) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="transferNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Transfer Number</FormLabel>
              <FormControl>
                <Input placeholder="Enter transfer number" {...field} readOnly />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="productId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product</FormLabel>
              <Popover open={productOpen} onOpenChange={setProductOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={productOpen}
                      className="w-full justify-between"
                    >
                      {field.value
                        ? products?.find((product) => product.id === field.value)?.name
                        : "Select product..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search products..." />
                    <CommandList>
                      <CommandEmpty>No product found.</CommandEmpty>
                      <CommandGroup>
                        {products?.map((product) => (
                          <CommandItem
                            key={product.id}
                            value={product.name}
                            onSelect={() => {
                              field.onChange(product.id);
                              setProductOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                field.value === product.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {product.name} - W:{product.warehouseStock} S:{product.storeStock}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="fromLocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>From Location</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="warehouse">Warehouse</SelectItem>
                    <SelectItem value="store">Store</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="toLocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>To Location</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select destination" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="warehouse">Warehouse</SelectItem>
                    <SelectItem value="store">Store</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="1"
                    max={availableStock}
                    placeholder=""
                    {...field} 
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
                {selectedProduct && (
                  <p className="text-sm text-muted-foreground">
                    Available in {watchedFromLocation}: {availableStock} units
                  </p>
                )}
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="technicianName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Technician</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select technician" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {technicians?.filter(tech => tech.status === 'active').map((technician) => (
                      <SelectItem key={technician.id} value={technician.name}>
                        {technician.name} ({technician.employeeId})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="activityType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Activity Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select activity" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="check">Check</SelectItem>
                    <SelectItem value="repair">Repair</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter any additional notes" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
            {createMutation.isPending || updateMutation.isPending ? (
              <div className="flex items-center">
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                {transfer ? "Updating..." : "Creating..."}
              </div>
            ) : (
              <>{transfer ? "Update Transfer" : "Create Transfer"}</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function Transfers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | undefined>();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: transfers, isLoading } = useQuery<Transfer[]>({
    queryKey: ["/api/transfers"],
  });

  const deleteMutation = useMutation({
    mutationFn: (transferId: number) =>
      apiRequest(`/api/transfers/${transferId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transfers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Transfer deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete transfer",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (transfer: Transfer) => {
    setSelectedTransfer(transfer);
    setDialogOpen(true);
  };

  const handleDelete = (transferId: number) => {
    if (confirm("Are you sure you want to delete this transfer?")) {
      deleteMutation.mutate(transferId);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedTransfer(undefined);
  };

  const filteredTransfers = transfers?.filter((transfer) => {
    const matchesSearch = transfer.transferNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transfer.product?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transfer.product?.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || transfer.status === statusFilter;
    const matchesLocation = locationFilter === "all" || 
                           transfer.fromLocation === locationFilter || 
                           transfer.toLocation === locationFilter;
    
    return matchesSearch && matchesStatus && matchesLocation;
  });

  const transferStats = transfers ? {
    totalTransfers: transfers.length,
    pendingTransfers: transfers.filter(t => t.status === "pending").length,
    approvedTransfers: transfers.filter(t => t.status === "approved").length,
    inTransitTransfers: transfers.filter(t => t.status === "in_transit").length,
    completedTransfers: transfers.filter(t => t.status === "completed").length,
  } : null;

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transfer Management</h1>
          <p className="text-muted-foreground">
            Manage inventory transfers between warehouse and store
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedTransfer(undefined)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Transfer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedTransfer ? "Edit Transfer" : "Create New Transfer"}
              </DialogTitle>
              <DialogDescription>
                {selectedTransfer ? "Update transfer details" : "Create a new inventory transfer"}
              </DialogDescription>
            </DialogHeader>
            <TransferForm transfer={selectedTransfer} onSuccess={handleDialogClose} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      {transferStats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transfers</CardTitle>
              <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{transferStats.totalTransfers}</div>
              <p className="text-xs text-muted-foreground">All transfers</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{transferStats.pendingTransfers}</div>
              <p className="text-xs text-muted-foreground">Awaiting approval</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <ArrowRightLeft className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{transferStats.approvedTransfers}</div>
              <p className="text-xs text-muted-foreground">Ready to ship</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Transit</CardTitle>
              <ArrowRightLeft className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{transferStats.inTransitTransfers}</div>
              <p className="text-xs text-muted-foreground">Being moved</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <ArrowRightLeft className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{transferStats.completedTransfers}</div>
              <p className="text-xs text-muted-foreground">Successfully moved</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Transfers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by transfer number or product..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="in_transit">In Transit</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="warehouse">Warehouse</SelectItem>
                  <SelectItem value="store">Store</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transfers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transfers</CardTitle>
          <CardDescription>
            {filteredTransfers?.length || 0} transfers found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredTransfers && filteredTransfers.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transfer #</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Technician</TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransfers.map((transfer) => (
                    <TableRow key={transfer.id}>
                      <TableCell className="font-medium">{transfer.transferNumber}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{transfer.product?.name}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {transfer.fromLocation === "warehouse" ? (
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                          )}
                          {transfer.fromLocation}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {transfer.toLocation === "warehouse" ? (
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                          )}
                          {transfer.toLocation}
                        </div>
                      </TableCell>
                      <TableCell>{transfer.quantity}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {transfer.technicianName || 'Not assigned'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={transfer.activityType === 'repair' ? 'destructive' : 'secondary'}>
                          {transfer.activityType?.charAt(0).toUpperCase() + transfer.activityType?.slice(1) || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          transfer.status === "completed" ? "default" : 
                          transfer.status === "approved" || transfer.status === "in_transit" ? "secondary" : 
                          transfer.status === "pending" ? "outline" :
                          "destructive"
                        }>
                          {transfer.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(transfer.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleEdit(transfer)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDelete(transfer.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <ArrowRightLeft className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No transfers found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== "all" || locationFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Get started by creating a new transfer"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}