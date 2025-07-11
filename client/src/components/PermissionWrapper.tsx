import { useAuth } from "@/contexts/AuthContext";

interface PermissionWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requirePermission?: keyof typeof defaultPermissions;
  requireFinancialAccess?: boolean;
  requirePriceAccess?: boolean;
  requireCostAccess?: boolean;
}

const defaultPermissions = {
  canManageUsers: false,
  canManageCustomers: false,
  canManageProducts: false,
  canManageInvoices: false,
  canManageTechnicians: false,
  canManageTransfers: false,
  canManageStaffVisas: false,
  canViewReports: false,
  canManageSettings: false,
  canViewPrices: false,
  canViewCosts: false,
  canViewFinancials: false,
};

export default function PermissionWrapper({
  children,
  fallback = null,
  requirePermission,
  requireFinancialAccess = false,
  requirePriceAccess = false,
  requireCostAccess = false,
}: PermissionWrapperProps) {
  const { user } = useAuth();

  if (!user) {
    return <>{fallback}</>;
  }

  const userPermissions = { ...defaultPermissions, ...(user.permissions || {}) };

  // Check specific permission if required
  if (requirePermission && !userPermissions[requirePermission]) {
    return <>{fallback}</>;
  }

  // Check financial access
  if (requireFinancialAccess && !userPermissions.canViewFinancials) {
    return <>{fallback}</>;
  }

  // Check price access
  if (requirePriceAccess && !userPermissions.canViewPrices) {
    return <>{fallback}</>;
  }

  // Check cost access
  if (requireCostAccess && !userPermissions.canViewCosts) {
    return <>{fallback}</>;
  }

  // User has required permissions
  return <>{children}</>;
}