import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./contexts/AuthContext";
import { AppProvider } from "./contexts/AppContext";
import NotFound from "@/pages/not-found";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Warehouse from "./components/Warehouse";
import Store from "./components/Store";
import Customers from "./components/Customers";
import Invoices from "./components/Invoices";
import Technicians from "./components/Technicians";
import Transfers from "./components/Transfers";
import StaffVisaManagement from "./components/StaffVisaManagement";
import Settings from "./components/Settings";
import Sidebar from "./components/Sidebar";
import AlertCenter from "./components/AlertCenter";
import { useAuth } from "./contexts/AuthContext";
import { useState, useEffect } from "react";

function AppContent() {
  const { user, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');

  useEffect(() => {
    // Initialize the database with default admin user
    fetch('/api/init', { method: 'POST' })
      .catch(console.error);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'warehouse':
        return <Warehouse />;
      case 'store':
        return <Store />;
      case 'customers':
        return <Customers />;
      case 'invoices':
        return <Invoices />;
      case 'technicians':
        return <Technicians />;
      case 'transfers':
        return <Transfers />;
      case 'staff-visas':
        return <StaffVisaManagement />;
      case 'alerts':
        return <AlertCenter />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-80 flex-shrink-0">
        <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      </div>
      <div className="flex-1 overflow-auto">
        {renderCurrentView()}
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <AppProvider>
            <Switch>
              <Route path="/" component={AppContent} />
              <Route component={NotFound} />
            </Switch>
          </AppProvider>
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
