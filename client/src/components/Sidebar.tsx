import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { 
  LayoutDashboard, 
  Building2, 
  ShoppingCart, 
  Users, 
  FileText, 
  Wrench, 
  ArrowRightLeft, 
  User, 
  Settings,
  LogOut,
  Building,
  Bell
} from "lucide-react";

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

const navigationItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    description: "Overview and analytics"
  },
  {
    id: "warehouse",
    label: "Warehouse",
    icon: Building2,
    description: "Inventory management"
  },
  {
    id: "store",
    label: "Store",
    icon: ShoppingCart,
    description: "Retail operations"
  },
  {
    id: "customers",
    label: "Customers",
    icon: Users,
    description: "Customer management"
  },
  {
    id: "invoices",
    label: "Invoices",
    icon: FileText,
    description: "Billing and payments"
  },
  {
    id: "technicians",
    label: "Technicians",
    icon: Wrench,
    description: "Service team"
  },
  {
    id: "transfers",
    label: "Transfers",
    icon: ArrowRightLeft,
    description: "Inventory movements"
  },
  {
    id: "staff-visas",
    label: "Staff Visas",
    icon: User,
    description: "Documentation management"
  },
  {
    id: "alerts",
    label: "Alerts",
    icon: Bell,
    description: "System notifications"
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    description: "System configuration"
  }
];

export default function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Building className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Business CRM</h1>
            <p className="text-sm text-gray-500">Management System</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
          Main Menu
        </div>
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 group",
                isActive
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon 
                className={cn(
                  "h-5 w-5 transition-colors",
                  isActive 
                    ? "text-blue-600" 
                    : "text-gray-400 group-hover:text-gray-600"
                )} 
              />
              <div className="flex-1">
                <div className={cn(
                  "font-medium text-sm",
                  isActive ? "text-blue-700" : "text-gray-700"
                )}>
                  {item.label}
                </div>
                <div className="text-xs text-gray-500 group-hover:text-gray-600">
                  {item.description}
                </div>
              </div>
              {isActive && (
                <div className="w-1 h-8 bg-blue-600 rounded-full" />
              )}
            </button>
          );
        })}
      </nav>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-gray-200">
        {user && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">
                  {user.name || user.username}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user.role}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}