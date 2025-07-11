import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Calculator, DollarSign, TrendingUp } from "lucide-react";
import { z } from "zod";

interface Product {
  id: number;
  name: string;
  sku: string;
  cost?: string;
  averageCost?: string;
  warehouseStock: number;
  storeStock: number;
}

interface PriceAveragingDialogProps {
  product: Product;
  children: React.ReactNode;
}

const priceUpdateSchema = z.object({
  cost: z.string().min(1, "Cost is required"),
  quantity: z.string().min(1, "Quantity is required"),
});

type PriceUpdateFormData = z.infer<typeof priceUpdateSchema>;

export default function PriceAveragingDialog({ product, children }: PriceAveragingDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<PriceUpdateFormData>({
    resolver: zodResolver(priceUpdateSchema),
    defaultValues: {
      cost: "",
      quantity: "",
    },
  });

  const updatePriceMutation = useMutation({
    mutationFn: (data: PriceUpdateFormData) =>
      apiRequest("POST", `/api/products/${product.id}/update-price`, {
        cost: parseFloat(data.cost),
        quantity: parseInt(data.quantity),
      }),
    onSuccess: async (response) => {
      const data = await response.json();
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      toast({
        title: "Price Updated",
        description: `${product.name} price updated with automatic averaging. New average cost: $${data.averageCost}`,
      });
      setOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update price",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PriceUpdateFormData) => {
    updatePriceMutation.mutate(data);
  };

  const currentCost = product.averageCost || product.cost || "0";
  const currentStock = product.warehouseStock + product.storeStock;
  const newCost = parseFloat(form.watch("cost") || "0");
  const newQuantity = parseInt(form.watch("quantity") || "0");

  // Calculate preview of new average cost
  const calculatePreviewAverage = () => {
    if (!newCost || !newQuantity) return currentCost;
    
    const totalValue = (currentStock * parseFloat(currentCost)) + (newQuantity * newCost);
    const totalQuantity = currentStock + newQuantity;
    
    return totalQuantity > 0 ? (totalValue / totalQuantity).toFixed(2) : newCost.toFixed(2);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Update Product Price
          </DialogTitle>
          <DialogDescription>
            Add new inventory with automatic price averaging for {product.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Information */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <Label className="text-sm text-gray-600">Current Stock</Label>
              <p className="font-medium">{currentStock} units</p>
            </div>
            <div>
              <Label className="text-sm text-gray-600">Current Avg Cost</Label>
              <p className="font-medium">${currentCost}</p>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Purchase Cost</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input 
                            placeholder="0.00" 
                            type="number" 
                            step="0.01" 
                            className="pl-10"
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity Adding</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="0" 
                          type="number" 
                          min="1"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Price Calculation Preview */}
              {newCost > 0 && newQuantity > 0 && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <h4 className="font-medium text-blue-800">Price Calculation Preview</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Current: {currentStock} × ${currentCost}</span>
                      <span>${(currentStock * parseFloat(currentCost)).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Adding: {newQuantity} × ${newCost.toFixed(2)}</span>
                      <span>${(newQuantity * newCost).toFixed(2)}</span>
                    </div>
                    <hr className="border-blue-200" />
                    <div className="flex justify-between font-medium text-blue-800">
                      <span>New Average: {currentStock + newQuantity} units</span>
                      <span>${calculatePreviewAverage()}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updatePriceMutation.isPending}
                  className="min-w-[100px]"
                >
                  {updatePriceMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      Updating...
                    </div>
                  ) : (
                    "Update Price"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}