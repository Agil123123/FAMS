// ==========================================================
// Permissions Constants
// All permissions from module_manifest.yaml
// ==========================================================

export const PERMISSIONS = {
  // Dashboard
  DASHBOARD_READ: 'dashboard.read',

  // Asset
  ASSET_READ: 'asset.read',
  ASSET_CREATE: 'asset.create',
  ASSET_UPDATE: 'asset.update',
  ASSET_DELETE: 'asset.delete',

  // Network
  NETWORK_READ: 'network.read',
  NETWORK_WRITE: 'network.write',

  // Fiber
  FIBER_READ: 'fiber.read',
  FIBER_WRITE: 'fiber.write',

  // GIS
  GIS_READ: 'gis.read',

  // Homepass
  HOMEPASS_READ: 'homepass.read',
  HOMEPASS_WRITE: 'homepass.write',

  // Customer
  CUSTOMER_READ: 'customer.read',
  CUSTOMER_CREATE: 'customer.create',
  CUSTOMER_UPDATE: 'customer.update',
  CUSTOMER_DELETE: 'customer.delete',

  // Work Order
  WORKORDER_READ: 'workorder.read',
  WORKORDER_CREATE: 'workorder.create',
  WORKORDER_UPDATE: 'workorder.update',
  WORKORDER_APPROVE: 'workorder.approve',

  // Monitoring
  MONITORING_READ: 'monitoring.read',

  // Report
  REPORT_READ: 'report.read',

  // User Management
  USER_READ: 'user.read',
  USER_CREATE: 'user.create',
  USER_UPDATE: 'user.update',
  USER_DELETE: 'user.delete',

  // Notification
  NOTIFICATION_READ: 'notification.read',

  // AI
  AI_USE: 'ai.use',

  // System
  SYSTEM_READ: 'system.read',
  SYSTEM_ADMIN: 'system.admin',
} as const;

export type PermissionKey = keyof typeof PERMISSIONS;
export type PermissionValue = (typeof PERMISSIONS)[PermissionKey];
