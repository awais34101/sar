import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Package, Plus } from "lucide-react";
import { z } from "zod";

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

const quickAddProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
});

type QuickAddProductFormData = z.infer<typeof quickAddProductSchema>;

interface Product {
  id: number;
  name: string;
  sku: string;
}

export default function QuickAddProduct({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: existingProducts } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const form = useForm<QuickAddProductFormData>({
    resolver: zodResolver(quickAddProductSchema),
    defaultValues: {
      name: "",
    },
  });

  const createProductMutation = useMutation({
    mutationFn: (data: QuickAddProductFormData) => {
      // Check for duplicates
      const duplicate = existingProducts?.find(p => 
        p.name.toLowerCase() === data.name.toLowerCase()
      );
      
      if (duplicate) {
        throw new Error(`Product "${data.name}" already exists with SKU: ${duplicate.sku}`);
      }

      // Generate SKU automatically
      const sku = data.name.slice(0, 3).toUpperCase() + Date.now().toString().slice(-6);
      
      return apiRequest("POST", "/api/products", {
        ...data,
        sku,
        category: "General",
        price: "0.00",
        cost: "0.00",
        warehouseStock: 0,
        storeStock: 0,
        minStockLevel: 5,
        status: "active",
      });
    },
    onSuccess: async (response) => {
      const data = await response.json();
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Product Added",
        description: `${data.name} has been added to the inventory with SKU: ${data.sku}`,
      });
      setOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add product",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: QuickAddProductFormData) => {
    createProductMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Quick Add Product
          </DialogTitle>
          <DialogDescription>
            Add a new product to inventory (SKU will be generated automatically)
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter product name (e.g., iPad Pro 12.9)"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-blue-50 p-3 rounded-lg border">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> This will create a basic product entry. Use the Purchase Invoice feature to add stock and set costs with automatic price averaging.
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createProductMutation.isPending}
                className="min-w-[100px]"
              >
                {createProductMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Adding...
                  </div>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}