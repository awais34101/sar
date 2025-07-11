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
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Wrench, Plus, Edit, Trash2, Search, Phone, Mail, User, Calendar } from "lucide-react";
import { z } from "zod";

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

const technicianSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  name: z.string().min(1, "Technician name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().min(1, "Phone number is required"),
  specialization: z.string().optional(),
  status: z.enum(["active", "inactive", "on_leave"]),
  hireDate: z.string().min(1, "Hire date is required"),
});

type TechnicianFormData = z.infer<typeof technicianSchema>;

const specializations = [
  "HVAC Systems",
  "Electrical Work",
  "Plumbing",
  "Network Installation",
  "Security Systems",
  "Appliance Repair",
  "Software Installation",
  "General Maintenance",
  "Automotive",
  "Electronics Repair",
  "Other"
];

function TechnicianForm({ technician, onSuccess }: { technician?: Technician; onSuccess: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<TechnicianFormData>({
    resolver: zodResolver(technicianSchema),
    defaultValues: {
      employeeId: technician?.employeeId || "",
      name: technician?.name || "",
      email: technician?.email || "",
      phone: technician?.phone || "",
      specialization: technician?.specialization || "",
      status: technician?.status as "active" | "inactive" | "on_leave" || "active",
      hireDate: technician?.hireDate || new Date().toISOString().split('T')[0],
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: TechnicianFormData) => 
      apiRequest("POST", `/api/technicians`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/technicians"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transfers"] });
      toast({
        title: "Success",
        description: "Technician created successfully",
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create technician",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: TechnicianFormData) =>
      apiRequest("PATCH", `/api/technicians/${technician?.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/technicians"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transfers"] });
      toast({
        title: "Success",
        description: "Technician updated successfully",
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update technician",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TechnicianFormData) => {
    if (technician) {
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
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter technician name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Enter email address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="Enter phone number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="specialization"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Specialization</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select specialization" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {specializations.map((spec) => (
                    <SelectItem key={spec} value={spec}>
                      {spec}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
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
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="on_leave">On Leave</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="hireDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hire Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
            {createMutation.isPending || updateMutation.isPending ? (
              <div className="flex items-center">
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                {technician ? "Updating..." : "Creating..."}
              </div>
            ) : (
              <>{technician ? "Update Technician" : "Create Technician"}</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function Technicians() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [specializationFilter, setSpecializationFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState<Technician | undefined>();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch technician activity stats with filters
  const [statsFilter, setStatsFilter] = useState({
    technicianName: "",
    activityType: "all",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  const { data: techStats } = useQuery({
    queryKey: ["/api/technician-stats", statsFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      if (statsFilter.technicianName) params.append('technicianName', statsFilter.technicianName);
      if (statsFilter.activityType) params.append('activityType', statsFilter.activityType);
      if (statsFilter.month) params.append('month', statsFilter.month.toString());
      if (statsFilter.year) params.append('year', statsFilter.year.toString());
      
      return fetch(`/api/technician-stats?${params.toString()}`).then(res => res.json());
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: technicians, isLoading } = useQuery<Technician[]>({
    queryKey: ["/api/technicians"],
  });

  const deleteMutation = useMutation({
    mutationFn: (technicianId: number) =>
      apiRequest(`/api/technicians/${technicianId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/technicians"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Technician deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete technician",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (technician: Technician) => {
    setSelectedTechnician(technician);
    setDialogOpen(true);
  };

  const handleDelete = (technicianId: number) => {
    if (confirm("Are you sure you want to delete this technician?")) {
      deleteMutation.mutate(technicianId);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedTechnician(undefined);
  };

  const filteredTechnicians = technicians?.filter((technician) => {
    const matchesSearch = technician.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         technician.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         technician.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || technician.status === statusFilter;
    const matchesSpecialization = specializationFilter === "all" || technician.specialization === specializationFilter;
    
    return matchesSearch && matchesStatus && matchesSpecialization;
  });

  const technicianStats = technicians ? {
    totalTechnicians: technicians.length,
    activeTechnicians: technicians.filter(t => t.status === "active").length,
    inactiveTechnicians: technicians.filter(t => t.status === "inactive").length,
    onLeaveTechnicians: technicians.filter(t => t.status === "on_leave").length,
  } : null;

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Technician Management</h1>
          <p className="text-muted-foreground">
            Manage your service technicians and their assignments
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedTechnician(undefined)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Technician
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedTechnician ? "Edit Technician" : "Add New Technician"}
              </DialogTitle>
              <DialogDescription>
                {selectedTechnician ? "Update technician information" : "Create a new technician record"}
              </DialogDescription>
            </DialogHeader>
            <TechnicianForm technician={selectedTechnician} onSuccess={handleDialogClose} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      {technicianStats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Technicians</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{technicianStats.totalTechnicians}</div>
              <p className="text-xs text-muted-foreground">All technicians</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <Wrench className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{technicianStats.activeTechnicians}</div>
              <p className="text-xs text-muted-foreground">Available for work</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive</CardTitle>
              <Wrench className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{technicianStats.inactiveTechnicians}</div>
              <p className="text-xs text-muted-foreground">Not available</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">On Leave</CardTitle>
              <Wrench className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{technicianStats.onLeaveTechnicians}</div>
              <p className="text-xs text-muted-foreground">Temporarily away</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Activity Tracking with Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Technician Activity Tracking</CardTitle>
          <CardDescription>
            Filter and view technician performance data
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <Label htmlFor="techFilter">Technician Name</Label>
              <Input
                id="techFilter"
                placeholder="Filter by technician name"
                value={statsFilter.technicianName}
                onChange={(e) => setStatsFilter(prev => ({ ...prev, technicianName: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="activityFilter">Activity Type</Label>
              <Select 
                value={statsFilter.activityType} 
                onValueChange={(value) => setStatsFilter(prev => ({ ...prev, activityType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Activities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Activities</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                  <SelectItem value="repair">Repair</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="monthFilter">Month</Label>
              <Select 
                value={statsFilter.month.toString()} 
                onValueChange={(value) => setStatsFilter(prev => ({ ...prev, month: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {new Date(2024, i).toLocaleDateString('default', { month: 'long' })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="yearFilter">Year</Label>
              <Select 
                value={statsFilter.year.toString()} 
                onValueChange={(value) => setStatsFilter(prev => ({ ...prev, year: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Stats Display */}
          {techStats && Object.keys(techStats).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(techStats).map(([techName, stats]) => {
                // Calculate activity type totals from activities array
                const checkCount = stats.activities?.filter(a => a.activityType === 'check').reduce((sum, a) => sum + a.quantity, 0) || 0;
                const repairCount = stats.activities?.filter(a => a.activityType === 'repair').reduce((sum, a) => sum + a.quantity, 0) || 0;
                const maintenanceCount = stats.activities?.filter(a => a.activityType === 'maintenance').reduce((sum, a) => sum + a.quantity, 0) || 0;
                const installationCount = stats.activities?.filter(a => a.activityType === 'installation').reduce((sum, a) => sum + a.quantity, 0) || 0;
                
                return (
                  <div key={techName} className="border rounded-lg p-4">
                    <h4 className="font-semibold text-lg mb-2">{techName}</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Checks:</span>
                        <span className="font-medium text-blue-600">{checkCount}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Repairs:</span>
                        <span className="font-medium text-orange-600">{repairCount}</span>
                      </div>
                      {maintenanceCount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span>Maintenance:</span>
                          <span className="font-medium text-purple-600">{maintenanceCount}</span>
                        </div>
                      )}
                      {installationCount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span>Installation:</span>
                          <span className="font-medium text-cyan-600">{installationCount}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm font-semibold border-t pt-2">
                        <span>Total Activities:</span>
                        <span className="text-green-600">{stats.totalActivities || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm font-semibold">
                        <span>Total Quantity:</span>
                        <span className="text-green-600">{stats.totalQuantity || 0}</span>
                      </div>
                      {stats.activities && stats.activities.length > 0 && (
                        <div className="mt-3 pt-2 border-t">
                          <span className="text-xs text-muted-foreground">Recent activities:</span>
                          <div className="text-xs space-y-1 mt-1">
                            {stats.activities.slice(0, 3).map((activity, idx) => (
                              <div key={idx} className="flex justify-between">
                                <span>{activity.productName}</span>
                                <span className="capitalize">{activity.activityType} ({activity.quantity})</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No activity data found for the selected filters
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Technicians</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name, ID, or email..."
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="on_leave">On Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="specialization">Specialization</Label>
              <Select value={specializationFilter} onValueChange={setSpecializationFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select specialization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specializations</SelectItem>
                  {specializations.map((spec) => (
                    <SelectItem key={spec} value={spec}>
                      {spec}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technicians Table */}
      <Card>
        <CardHeader>
          <CardTitle>Technicians</CardTitle>
          <CardDescription>
            {filteredTechnicians?.length || 0} technicians found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredTechnicians && filteredTechnicians.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Specialization</TableHead>
                    <TableHead>Hire Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTechnicians.map((technician) => (
                    <TableRow key={technician.id}>
                      <TableCell className="font-medium">{technician.employeeId}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {technician.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        {technician.email ? (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            {technician.email}
                          </div>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          {technician.phone}
                        </div>
                      </TableCell>
                      <TableCell>{technician.specialization || "-"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(technician.hireDate).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          technician.status === "active" ? "default" : 
                          technician.status === "on_leave" ? "secondary" : 
                          "outline"
                        }>
                          {technician.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleEdit(technician)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDelete(technician.id)}
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
              <Wrench className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No technicians found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== "all" || specializationFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Get started by adding a new technician"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}