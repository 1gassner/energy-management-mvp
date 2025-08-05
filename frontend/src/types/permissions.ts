/**
 * CityPulse Permission System
 * Role-based Access Control für alle 6 User-Typen
 */

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager', 
  USER = 'user',
  BUERGERMEISTER = 'buergermeister',
  GEBAEUDEMANAGER = 'gebaeudemanager',
  BUERGER = 'buerger'
}

export enum Permission {
  // System Administration
  MANAGE_USERS = 'manage_users',
  MANAGE_BUILDINGS = 'manage_buildings',
  MANAGE_SENSORS = 'manage_sensors',
  SYSTEM_SETTINGS = 'system_settings',
  
  // Data Access
  VIEW_ALL_BUILDINGS = 'view_all_buildings',
  VIEW_ASSIGNED_BUILDINGS = 'view_assigned_buildings',
  VIEW_PUBLIC_DATA = 'view_public_data',
  VIEW_DETAILED_ANALYTICS = 'view_detailed_analytics',
  
  // Operations
  CONTROL_SENSORS = 'control_sensors',
  MANAGE_ALERTS = 'manage_alerts',
  EXPORT_DATA = 'export_data',
  GENERATE_REPORTS = 'generate_reports',
  
  // Financial
  VIEW_COSTS = 'view_costs',
  VIEW_BUDGET = 'view_budget',
  MANAGE_BUDGET = 'manage_budget',
  APPROVE_INVESTMENTS = 'approve_investments',
  VIEW_FINANCIAL_REPORTS = 'view_financial_reports',
  MANAGE_INVOICES = 'manage_invoices',
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    // Full system access
    Permission.MANAGE_USERS,
    Permission.MANAGE_BUILDINGS,
    Permission.MANAGE_SENSORS,
    Permission.SYSTEM_SETTINGS,
    Permission.VIEW_ALL_BUILDINGS,
    Permission.VIEW_DETAILED_ANALYTICS,
    Permission.CONTROL_SENSORS,
    Permission.MANAGE_ALERTS,
    Permission.EXPORT_DATA,
    Permission.GENERATE_REPORTS,
    Permission.VIEW_COSTS,
    Permission.VIEW_BUDGET,
    Permission.MANAGE_BUDGET,
    Permission.APPROVE_INVESTMENTS,
    Permission.VIEW_FINANCIAL_REPORTS,
    Permission.MANAGE_INVOICES,
  ],
  
  [UserRole.BUERGERMEISTER]: [
    // Strategic overview and decision making
    Permission.VIEW_ALL_BUILDINGS,
    Permission.VIEW_DETAILED_ANALYTICS,
    Permission.GENERATE_REPORTS,
    Permission.VIEW_COSTS,
    Permission.VIEW_BUDGET,
    Permission.MANAGE_BUDGET,
    Permission.APPROVE_INVESTMENTS,
    Permission.VIEW_FINANCIAL_REPORTS,
    Permission.EXPORT_DATA,
    Permission.MANAGE_ALERTS, // High-level alerts only
  ],
  
  [UserRole.GEBAEUDEMANAGER]: [
    // Building operations and maintenance
    Permission.VIEW_ASSIGNED_BUILDINGS,
    Permission.CONTROL_SENSORS,
    Permission.MANAGE_ALERTS,
    Permission.VIEW_DETAILED_ANALYTICS,
    Permission.EXPORT_DATA,
    Permission.VIEW_COSTS, // For assigned buildings
  ],
  
  [UserRole.MANAGER]: [
    // Department management
    Permission.VIEW_ALL_BUILDINGS,
    Permission.MANAGE_ALERTS,
    Permission.EXPORT_DATA,
    Permission.GENERATE_REPORTS,
    Permission.VIEW_COSTS,
  ],
  
  [UserRole.USER]: [
    // Staff access
    Permission.VIEW_ASSIGNED_BUILDINGS,
    Permission.VIEW_PUBLIC_DATA,
    Permission.EXPORT_DATA,
  ],
  
  [UserRole.BUERGER]: [
    // Public citizen access
    Permission.VIEW_PUBLIC_DATA,
  ],
};

export const BUILDING_ACCESS: Record<UserRole, string[] | 'all'> = {
  [UserRole.ADMIN]: 'all',
  [UserRole.BUERGERMEISTER]: 'all',
  [UserRole.MANAGER]: 'all',
  [UserRole.GEBAEUDEMANAGER]: [], // Set dynamically based on assignment
  [UserRole.USER]: [], // Set dynamically based on assignment
  [UserRole.BUERGER]: ['rathaus-hechingen'], // Only public buildings
};

export class PermissionService {
  static hasPermission(userRole: UserRole, permission: Permission): boolean {
    const rolePermissions = ROLE_PERMISSIONS[userRole];
    return rolePermissions.includes(permission);
  }
  
  static canAccessBuilding(userRole: UserRole, buildingId: string, assignedBuildings?: string[]): boolean {
    const access = BUILDING_ACCESS[userRole];
    
    if (access === 'all') return true;
    
    if (userRole === UserRole.GEBAEUDEMANAGER || userRole === UserRole.USER) {
      return assignedBuildings?.includes(buildingId) || false;
    }
    
    return access.includes(buildingId);
  }
  
  static getNavigationItems(userRole: UserRole): Array<{
    path: string;
    label: string;
    icon?: string;
    roles: UserRole[];
  }> {
    const allItems = [
      {
        path: '/dashboard',
        label: 'Dashboard',
        icon: 'LayoutDashboard',
        roles: [UserRole.ADMIN, UserRole.BUERGERMEISTER, UserRole.MANAGER, UserRole.GEBAEUDEMANAGER, UserRole.USER]
      },
      {
        path: '/energy-flow',
        label: 'Stadt-Daten',
        icon: 'Zap',
        roles: [UserRole.ADMIN, UserRole.BUERGERMEISTER, UserRole.MANAGER, UserRole.GEBAEUDEMANAGER]
      },
      {
        path: '/analytics/ai',
        label: 'Analytics',
        icon: 'BarChart3',
        roles: [UserRole.ADMIN, UserRole.BUERGERMEISTER, UserRole.MANAGER]
      },
      {
        path: '/alerts',
        label: 'Alerts',
        icon: 'AlertTriangle',
        roles: [UserRole.ADMIN, UserRole.BUERGERMEISTER, UserRole.MANAGER, UserRole.GEBAEUDEMANAGER]
      },
      {
        path: '/admin',
        label: 'Admin',
        icon: 'Settings',
        roles: [UserRole.ADMIN]
      },
      {
        path: '/admin/sensors',
        label: 'Sensorverwaltung',
        icon: 'Radio',
        roles: [UserRole.ADMIN, UserRole.GEBAEUDEMANAGER]
      },
      {
        path: '/public',
        label: 'Öffentliche Daten',
        icon: 'Globe',
        roles: [UserRole.BUERGER]
      }
    ];
    
    return allItems.filter(item => item.roles.includes(userRole));
  }
}