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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { FileText, Plus, Edit, Trash2, Search, Calendar, User, AlertTriangle, Clock } from "lucide-react";
import { z } from "zod";

interface StaffVisa {
  id: number;
  employeeId: string;
  name: string;
  passportNumber: string;
  visaType: string;
  visaNumber?: string;
  issueDate?: string;
  expiryDate?: string;
  status: string;
  sponsor?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const staffVisaSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  name: z.string().min(1, "Employee name is required"),
  passportNumber: z.string().min(1, "Passport number is required"),
  visaType: z.string().min(1, "Visa type is required"),
  visaNumber: z.string().optional(),
  issueDate: z.string().optional(),
  expiryDate: z.string().optional(),
  status: z.enum(["pending", "approved", "rejected", "expired", "renewed"]),
  sponsor: z.string().optional(),
  notes: z.string().optional(),
});

type StaffVisaFormData = z.infer<typeof staffVisaSchema>;

const visaTypes = [
  "Work Visa",
  "Business Visa", 
  "Skilled Worker Visa",
  "Temporary Work Visa",
  "Investor Visa",
  "Student Visa",
  "Family Visa",
  "Transit Visa",
  "Tourist Visa",
  "Other"
];

function StaffVisaForm({ staffVisa, onSuccess }: { staffVisa?: StaffVisa; onSuccess: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<StaffVisaFormData>({
    resolver: zodResolver(staffVisaSchema),
    defaultValues: {
      employeeId: staffVisa?.employeeId || "",
      name: staffVisa?.name || "",
      passportNumber: staffVisa?.passportNumber || "",
      visaType: staffVisa?.visaType || "",
      visaNumber: staffVisa?.visaNumber || "",
      issueDate: staffVisa?.issueDate || "",
      expiryDate: staffVisa?.expiryDate || "",
      status: staffVisa?.status as "pending" | "approved" | "rejected" | "expired" | "renewed" || "pending",
      sponsor: staffVisa?.sponsor || "",
      notes: staffVisa?.notes || "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: StaffVisaFormData) => 
      apiRequest("POST", `/api/staff-visas`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff-visas"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Staff visa record created successfully",
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create staff visa record",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: StaffVisaFormData) =>
      apiRequest("PATCH", `/api/staff-visas/${staffVisa?.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff-visas"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Staff visa record updated successfully",
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update staff visa record",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: StaffVisaFormData) => {
    if (staffVisa) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="employeeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Employee ID</FormLabel>
                <FormControl>
                  <Input placeholder="Enter employee ID" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Employee Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter employee name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="passportNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Passport Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter passport number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="visaNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Visa Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter visa number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="visaType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Visa Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select visa type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {visaTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="renewed">Renewed</SelectItem>
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
            name="issueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Issue Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="expiryDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expiry Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="sponsor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sponsor</FormLabel>
              <FormControl>
                <Input placeholder="Enter sponsor information" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
                {staffVisa ? "Updating..." : "Creating..."}
              </div>
            ) : (
              <>{staffVisa ? "Update Record" : "Create Record"}</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function StaffVisaManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [visaTypeFilter, setVisaTypeFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStaffVisa, setSelectedStaffVisa] = useState<StaffVisa | undefined>();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: staffVisas, isLoading } = useQuery<StaffVisa[]>({
    queryKey: ["/api/staff-visas"],
  });

  const deleteMutation = useMutation({
    mutationFn: (staffVisaId: number) =>
      apiRequest(`/api/staff-visas/${staffVisaId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff-visas"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Staff visa record deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete staff visa record",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (staffVisa: StaffVisa) => {
    setSelectedStaffVisa(staffVisa);
    setDialogOpen(true);
  };

  const handleDelete = (staffVisaId: number) => {
    if (confirm("Are you sure you want to delete this staff visa record?")) {
      deleteMutation.mutate(staffVisaId);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedStaffVisa(undefined);
  };

  // Check for expiring visas (within 90 days)
  const getExpiringVisas = (visas: StaffVisa[]) => {
    const now = new Date();
    const ninetyDaysFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    
    return visas.filter(visa => {
      if (!visa.expiryDate) return false;
      const expiryDate = new Date(visa.expiryDate);
      return expiryDate <= ninetyDaysFromNow && expiryDate >= now && visa.status === "approved";
    });
  };

  const filteredStaffVisas = staffVisas?.filter((staffVisa) => {
    const matchesSearch = staffVisa.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staffVisa.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staffVisa.passportNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || staffVisa.status === statusFilter;
    const matchesVisaType = visaTypeFilter === "all" || staffVisa.visaType === visaTypeFilter;
    
    return matchesSearch && matchesStatus && matchesVisaType;
  });

  const visaStats = staffVisas ? {
    totalRecords: staffVisas.length,
    approvedVisas: staffVisas.filter(v => v.status === "approved").length,
    pendingVisas: staffVisas.filter(v => v.status === "pending").length,
    expiredVisas: staffVisas.filter(v => v.status === "expired").length,
    expiringVisas: getExpiringVisas(staffVisas).length,
  } : null;

  const expiringVisas = staffVisas ? getExpiringVisas(staffVisas) : [];

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff Visa Management</h1>
          <p className="text-muted-foreground">
            Track and manage employee visa documentation and renewals
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedStaffVisa(undefined)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Staff Visa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedStaffVisa ? "Edit Staff Visa" : "Add New Staff Visa"}
              </DialogTitle>
              <DialogDescription>
                {selectedStaffVisa ? "Update visa record information" : "Create a new staff visa record"}
              </DialogDescription>
            </DialogHeader>
            <StaffVisaForm staffVisa={selectedStaffVisa} onSuccess={handleDialogClose} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      {visaStats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Records</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{visaStats.totalRecords}</div>
              <p className="text-xs text-muted-foreground">All visa records</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <FileText className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{visaStats.approvedVisas}</div>
              <p className="text-xs text-muted-foreground">Active visas</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{visaStats.pendingVisas}</div>
              <p className="text-xs text-muted-foreground">Under review</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{visaStats.expiringVisas}</div>
              <p className="text-xs text-muted-foreground">Within 90 days</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expired</CardTitle>
              <FileText className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{visaStats.expiredVisas}</div>
              <p className="text-xs text-muted-foreground">Need renewal</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Expiring Visas Alert */}
      {expiringVisas.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              Visa Renewal Alert
            </CardTitle>
            <CardDescription className="text-orange-700">
              {expiringVisas.length} visa{expiringVisas.length > 1 ? 's' : ''} expiring within 90 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {expiringVisas.slice(0, 3).map((visa) => (
                <div key={visa.id} className="flex items-center justify-between p-2 bg-white rounded border">
                  <div>
                    <p className="font-medium text-sm">{visa.name}</p>
                    <p className="text-xs text-muted-foreground">{visa.employeeId} - {visa.visaType}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="text-orange-600">
                      Expires {visa.expiryDate ? new Date(visa.expiryDate).toLocaleDateString() : 'Unknown'}
                    </Badge>
                  </div>
                </div>
              ))}
              {expiringVisas.length > 3 && (
                <p className="text-sm text-orange-700 text-center">
                  And {expiringVisas.length - 3} more...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Staff Visas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name, ID, or passport..."
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
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="renewed">Renewed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="visaType">Visa Type</Label>
              <Select value={visaTypeFilter} onValueChange={setVisaTypeFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select visa type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Visa Types</SelectItem>
                  {visaTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Staff Visas Table */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Visa Records</CardTitle>
          <CardDescription>
            {filteredStaffVisas?.length || 0} records found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredStaffVisas && filteredStaffVisas.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Passport</TableHead>
                    <TableHead>Visa Type</TableHead>
                    <TableHead>Visa Number</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStaffVisas.map((staffVisa) => {
                    const isExpiringSoon = expiringVisas.some(v => v.id === staffVisa.id);
                    
                    return (
                      <TableRow key={staffVisa.id} className={isExpiringSoon ? "bg-orange-50" : ""}>
                        <TableCell className="font-medium">{staffVisa.employeeId}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {staffVisa.name}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono">{staffVisa.passportNumber}</TableCell>
                        <TableCell>{staffVisa.visaType}</TableCell>
                        <TableCell className="font-mono">{staffVisa.visaNumber || "-"}</TableCell>
                        <TableCell>
                          {staffVisa.expiryDate ? (
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {new Date(staffVisa.expiryDate).toLocaleDateString()}
                              {isExpiringSoon && (
                                <AlertTriangle className="h-4 w-4 text-orange-600" />
                              )}
                            </div>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            staffVisa.status === "approved" ? "default" : 
                            staffVisa.status === "pending" ? "secondary" : 
                            staffVisa.status === "expired" ? "destructive" :
                            staffVisa.status === "renewed" ? "default" :
                            "outline"
                          }>
                            {staffVisa.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleEdit(staffVisa)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDelete(staffVisa.id)}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No visa records found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== "all" || visaTypeFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Get started by adding a new staff visa record"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}