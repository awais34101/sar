import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Bell, AlertTriangle, CheckCircle, Clock, TrendingDown } from "lucide-react";

interface SystemAlert {
  id: number;
  type: string;
  title: string;
  message: string;
  productId?: number;
  referenceId?: number;
  isRead: boolean;
  priority: string;
  createdAt: string;
}

export default function AlertCenter() {
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('unread');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: alerts, isLoading } = useQuery<SystemAlert[]>({
    queryKey: ["/api/alerts", filter === 'all' ? undefined : filter === 'unread' ? 'false' : 'true'],
  });

  const markAsReadMutation = useMutation({
    mutationFn: (alertId: number) =>
      apiRequest("PATCH", `/api/alerts/${alertId}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      toast({
        title: "Alert marked as read",
        description: "The alert has been marked as read.",
      });
    },
  });

  const lowMovingStockMutation = useMutation({
    mutationFn: () =>
      apiRequest("GET", `/api/alerts/low-moving-stock?days=30`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      toast({
        title: "Low moving stock check completed",
        description: "Alerts have been generated for items with no recent sales.",
      });
    },
  });

  const getAlertIcon = (type: string, priority: string) => {
    switch (type) {
      case 'low_moving_stock':
        return <TrendingDown className="h-4 w-4" />;
      case 'transfer_notification':
        return <Clock className="h-4 w-4" />;
      case 'price_change':
        return <AlertTriangle className="h-4 w-4" />;
      case 'visa_expiry':
        return <Bell className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const filteredAlerts = alerts || [];
  const unreadCount = filteredAlerts.filter(alert => !alert.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Alert Center</h2>
          <p className="text-muted-foreground">
            System notifications and alerts ({unreadCount} unread)
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => lowMovingStockMutation.mutate()}
            disabled={lowMovingStockMutation.isPending}
          >
            <TrendingDown className="h-4 w-4 mr-2" />
            Check Low Moving Stock
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All Alerts
        </Button>
        <Button
          variant={filter === 'unread' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('unread')}
        >
          Unread ({unreadCount})
        </Button>
        <Button
          variant={filter === 'read' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('read')}
        >
          Read
        </Button>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-lg font-medium">No alerts</h3>
              <p className="text-muted-foreground text-center">
                {filter === 'unread' 
                  ? "You're all caught up! No unread alerts."
                  : "No alerts found for the selected filter."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredAlerts.map((alert) => (
            <Card key={alert.id} className={!alert.isRead ? "border-l-4 border-l-blue-500" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      alert.priority === 'critical' ? 'bg-red-100 text-red-600' :
                      alert.priority === 'high' ? 'bg-orange-100 text-orange-600' :
                      alert.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {getAlertIcon(alert.type, alert.priority)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">{alert.title}</CardTitle>
                        <Badge variant={getPriorityColor(alert.priority) as any}>
                          {alert.priority}
                        </Badge>
                        {!alert.isRead && (
                          <Badge variant="secondary">New</Badge>
                        )}
                      </div>
                      <CardDescription className="mt-1">
                        {new Date(alert.createdAt).toLocaleString()}
                      </CardDescription>
                    </div>
                  </div>
                  {!alert.isRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAsReadMutation.mutate(alert.id)}
                      disabled={markAsReadMutation.isPending}
                    >
                      Mark as Read
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{alert.message}</p>
                {alert.productId && (
                  <div className="mt-2">
                    <Badge variant="outline">Product ID: {alert.productId}</Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}