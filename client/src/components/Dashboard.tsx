import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  TrendingUp, 
  Users, 
  FileText, 
  Package,
  AlertTriangle,
  DollarSign,
  ShoppingCart,
  Clock,
  BarChart3
} from "lucide-react";

interface DashboardStats {
  totalRevenue: number;
  totalCustomers: number;
  pendingInvoices: number;
  totalProducts: number;
  lowStockCount: number;
}

interface Product {
  id: number;
  name: string;
  sku: string;
  price?: string;
  warehouseStock: number;
  storeStock: number;
  minStockLevel: number;
  category: string;
}

interface Invoice {
  id: number;
  invoiceNumber: string;
  customerId: number;
  customerName?: string;
  total: string;
  status: string;
  issueDate: string;
  dueDate: string;
}

function StatCard({ title, value, icon: Icon, description, trend }: {
  title: string;
  value: string | number;
  icon: any;
  description: string;
  trend?: "up" | "down" | "neutral";
}) {
  const trendColor = trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-gray-600";
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className={`text-xs ${trendColor}`}>{description}</p>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: lowStockProducts, isLoading: lowStockLoading } = useQuery<Product[]>({
    queryKey: ["/api/products/low-stock"],
  });

  const { data: recentInvoices, isLoading: invoicesLoading } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices", { limit: 5, status: "pending" }],
  });

  const { data: products, isLoading: productLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Calculate store analytics and top value products
  const storeAnalytics = products ? {
    totalProducts: products.filter(p => p.storeStock > 0).length,
    totalStock: products.reduce((sum, p) => sum + p.storeStock, 0),
    lowStockCount: products.filter(p => p.storeStock > 0 && p.storeStock < p.minStockLevel).length,
    outOfStockCount: products.filter(p => p.storeStock === 0).length,
    totalValue: products.reduce((sum, p) => sum + (p.storeStock * parseFloat(p.price || '0')), 0),
  } : null;

  const topValueProducts = products ? 
    [...products]
      .filter(p => p.storeStock > 0)
      .sort((a, b) => parseFloat(b.price || '0') - parseFloat(a.price || '0'))
      .slice(0, 5) : [];

  // Calculate sales analytics from invoices
  const { data: allInvoices } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices"],
  });

  const salesAnalytics = allInvoices ? (() => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    
    const todayStr = formatDate(today);
    const yesterdayStr = formatDate(yesterday);
    
    const paidInvoices = allInvoices.filter(inv => inv.status === 'paid');
    
    const todaySales = paidInvoices
      .filter(inv => inv.issueDate === todayStr)
      .reduce((sum, inv) => sum + parseFloat(inv.total || '0'), 0);
    
    const yesterdaySales = paidInvoices
      .filter(inv => inv.issueDate === yesterdayStr)
      .reduce((sum, inv) => sum + parseFloat(inv.total || '0'), 0);
    
    const thisMonthSales = paidInvoices
      .filter(inv => {
        const invDate = new Date(inv.issueDate);
        return invDate >= thisMonth && invDate <= today;
      })
      .reduce((sum, inv) => sum + parseFloat(inv.total || '0'), 0);
    
    const lastMonthSales = paidInvoices
      .filter(inv => {
        const invDate = new Date(inv.issueDate);
        return invDate >= lastMonth && invDate <= lastMonthEnd;
      })
      .reduce((sum, inv) => sum + parseFloat(inv.total || '0'), 0);

    return {
      todaySales,
      yesterdaySales,
      thisMonthSales,
      lastMonthSales
    };
  })() : {
    todaySales: 0,
    yesterdaySales: 0,
    thisMonthSales: 0,
    lastMonthSales: 0
  };

  if (statsLoading) {
    return (
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your business management system
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="space-y-6 p-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Unable to load dashboard data. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your business management system
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={`${stats.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          description="Total sales revenue"
          trend="up"
        />
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers}
          icon={Users}
          description="Active customer base"
          trend="up"
        />
        <StatCard
          title="Pending Invoices"
          value={stats.pendingInvoices}
          icon={FileText}
          description="Invoices awaiting payment"
          trend="neutral"
        />
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon={Package}
          description="Products in inventory"
          trend="up"
        />
      </div>

      {/* Sales Analytics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Today's Sales"
          value={salesAnalytics.todaySales.toFixed(2)}
          icon={DollarSign}
          description="Sales revenue today"
          trend="up"
        />
        <StatCard
          title="Yesterday's Sales"
          value={salesAnalytics.yesterdaySales.toFixed(2)}
          icon={TrendingUp}
          description="Sales revenue yesterday"
          trend="neutral"
        />
        <StatCard
          title="This Month Sales"
          value={salesAnalytics.thisMonthSales.toFixed(2)}
          icon={FileText}
          description="Month-to-date sales revenue"
          trend="up"
        />
        <StatCard
          title="Last Month Sales"
          value={salesAnalytics.lastMonthSales.toFixed(2)}
          icon={Package}
          description="Previous month sales revenue"
          trend="neutral"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Low Stock Alert */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Low Stock Alert
              {lowStockProducts && lowStockProducts.length > 0 && (
                <Badge variant="destructive">{lowStockProducts.length}</Badge>
              )}
            </CardTitle>
            <CardDescription>Items below minimum stock level</CardDescription>
          </CardHeader>
          <CardContent>
            {lowStockLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            ) : lowStockProducts && lowStockProducts.length > 0 ? (
              <div className="space-y-2">
                {lowStockProducts.slice(0, 5).map((product) => (
                  <div key={product.id} className="flex justify-between text-sm">
                    <span className="font-medium">{product.name}</span>
                    <span className="text-muted-foreground">
                      {product.warehouseStock + product.storeStock} remaining
                    </span>
                  </div>
                ))}
                {lowStockProducts.length > 5 && (
                  <p className="text-xs text-muted-foreground">
                    +{lowStockProducts.length - 5} more items
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">All stock levels are healthy</p>
            )}
          </CardContent>
        </Card>

        {/* Top Value Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Top Value Products
            </CardTitle>
            <CardDescription>Highest value items in store</CardDescription>
          </CardHeader>
          <CardContent>
            {productLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            ) : topValueProducts && topValueProducts.length > 0 ? (
              <div className="space-y-2">
                {topValueProducts.slice(0, 5).map((product, index) => (
                  <div key={product.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-5 h-5 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">
                        {index + 1}
                      </div>
                      <span className="font-medium">{product.name}</span>
                    </div>
                    <span className="text-muted-foreground">{product.price}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No products available</p>
            )}
          </CardContent>
        </Card>

        {/* Store Analytics */}
        <Card>
          <CardHeader>
            <CardTitle>Store Analytics</CardTitle>
            <CardDescription>Key performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Inventory Turnover</span>
                <span className="text-sm font-medium">2.3x</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Avg. Item Value</span>
                <span className="text-sm font-medium">
                  {storeAnalytics ? (storeAnalytics.totalValue / Math.max(storeAnalytics.totalStock, 1)).toFixed(2) : '0.00'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Stock Efficiency</span>
                <span className="text-sm font-medium">
                  {storeAnalytics ? ((storeAnalytics.totalProducts / Math.max(storeAnalytics.totalProducts + storeAnalytics.outOfStockCount, 1)) * 100).toFixed(1) : '0'}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Reorder Rate</span>
                <span className="text-sm font-medium">
                  {storeAnalytics ? ((storeAnalytics.lowStockCount / Math.max(storeAnalytics.totalProducts, 1)) * 100).toFixed(1) : '0'}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Invoices
            </CardTitle>
            <CardDescription>Latest customer invoices</CardDescription>
          </CardHeader>
          <CardContent>
            {invoicesLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            ) : recentInvoices && recentInvoices.length > 0 ? (
              <div className="space-y-2">
                {recentInvoices.slice(0, 5).map((invoice) => (
                  <div key={invoice.id} className="flex justify-between text-sm">
                    <span className="font-medium">{invoice.customerName || 'Unknown Customer'}</span>
                    <span className="text-muted-foreground">{invoice.total}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No recent invoices</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}