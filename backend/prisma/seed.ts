// ==========================================================
// FAMS Database Seed
// Seeds: roles, permissions, super_admin user, initial masters
// ==========================================================

import { PrismaClient, UserStatus } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

// All permissions from module_manifest.yaml
const PERMISSIONS = [
  { name: 'dashboard.read', module: 'dashboard', action: 'read', description: 'View dashboard' },
  { name: 'asset.read', module: 'asset', action: 'read', description: 'View assets' },
  { name: 'asset.create', module: 'asset', action: 'create', description: 'Create assets' },
  { name: 'asset.update', module: 'asset', action: 'update', description: 'Update assets' },
  { name: 'asset.delete', module: 'asset', action: 'delete', description: 'Delete assets' },
  { name: 'network.read', module: 'network', action: 'read', description: 'View network' },
  { name: 'network.write', module: 'network', action: 'write', description: 'Manage network' },
  { name: 'fiber.read', module: 'fiber', action: 'read', description: 'View fiber' },
  { name: 'fiber.write', module: 'fiber', action: 'write', description: 'Manage fiber' },
  { name: 'gis.read', module: 'gis', action: 'read', description: 'View GIS' },
  { name: 'homepass.read', module: 'homepass', action: 'read', description: 'View homepasses' },
  { name: 'homepass.write', module: 'homepass', action: 'write', description: 'Manage homepasses' },
  { name: 'customer.read', module: 'customer', action: 'read', description: 'View customers' },
  { name: 'customer.create', module: 'customer', action: 'create', description: 'Create customers' },
  { name: 'customer.update', module: 'customer', action: 'update', description: 'Update customers' },
  { name: 'customer.delete', module: 'customer', action: 'delete', description: 'Delete customers' },
  { name: 'workorder.read', module: 'workorder', action: 'read', description: 'View work orders' },
  { name: 'workorder.create', module: 'workorder', action: 'create', description: 'Create work orders' },
  { name: 'workorder.update', module: 'workorder', action: 'update', description: 'Update work orders' },
  { name: 'workorder.approve', module: 'workorder', action: 'approve', description: 'Approve work orders' },
  { name: 'monitoring.read', module: 'monitoring', action: 'read', description: 'View monitoring' },
  { name: 'report.read', module: 'report', action: 'read', description: 'View reports' },
  { name: 'user.read', module: 'user_management', action: 'read', description: 'View users' },
  { name: 'user.create', module: 'user_management', action: 'create', description: 'Create users' },
  { name: 'user.update', module: 'user_management', action: 'update', description: 'Update users' },
  { name: 'user.delete', module: 'user_management', action: 'delete', description: 'Delete users' },
  { name: 'notification.read', module: 'notification', action: 'read', description: 'View notifications' },
  { name: 'ai.use', module: 'ai', action: 'use', description: 'Use AI assistant' },
  { name: 'system.read', module: 'system', action: 'read', description: 'View system settings' },
  { name: 'system.admin', module: 'system', action: 'admin', description: 'Administrate system' },
];

const ROLES = [
  { name: 'super_admin', description: 'Super Administrator - Full access', is_system: true },
  { name: 'admin', description: 'Administrator - Manage all modules', is_system: true },
  { name: 'manager', description: 'Manager - View and approve', is_system: false },
  { name: 'supervisor', description: 'Supervisor - Oversee field operations', is_system: false },
  { name: 'technician', description: 'Technician - Field work operations', is_system: false },
  { name: 'viewer', description: 'Viewer - Read-only access', is_system: false },
];

async function seedMasters() {
  console.log('📦 Seeding Master Data...');

  // Branches
  const hq = await prisma.branch.upsert({
    where: { code: 'HQ-001' },
    update: {},
    create: { name: 'Headquarters', code: 'HQ-001' },
  });

  // Asset Types
  const assetTypes = ['OLT', 'ODC', 'Closure', 'ODP', 'Splitter', 'Cable', 'Pole', 'Joint Box'];
  for (const name of assetTypes) {
    await prisma.assetType.create({ data: { name } });
  }

  // Cable Types
  await prisma.cableType.create({ data: { name: '96 Core Direct Burial', core_count: 96 } });
  await prisma.cableType.create({ data: { name: '48 Core Aerial', core_count: 48 } });
  await prisma.cableType.create({ data: { name: '24 Core Distribution', core_count: 24 } });

  // Splitter Types
  await prisma.splitterType.create({ data: { name: '1:4 PLC Splitter', ratio_in: 1, ratio_out: 4 } });
  await prisma.splitterType.create({ data: { name: '1:8 PLC Splitter', ratio_in: 1, ratio_out: 8 } });
  await prisma.splitterType.create({ data: { name: '1:16 PLC Splitter', ratio_in: 1, ratio_out: 16 } });

  // Package Profiles
  await prisma.packageProfile.create({ data: { name: 'Home Basic 20Mbps', speed_mbps: 20, price: 15.00 } });
  await prisma.packageProfile.create({ data: { name: 'Home Plus 50Mbps', speed_mbps: 50, price: 25.00 } });
  await prisma.packageProfile.create({ data: { name: 'Pro 100Mbps', speed_mbps: 100, price: 40.00 } });
}

async function main() {
  console.log('🌱 Seeding FAMS database...');

  // Seed permissions
  console.log('📋 Seeding permissions...');
  for (const perm of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm,
    });
  }

  // Seed roles
  console.log('🔑 Seeding roles...');
  for (const role of ROLES) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  }

  // Assign all permissions to super_admin
  const superAdminRole = await prisma.role.findUnique({ where: { name: 'super_admin' } });
  const allPermissions = await prisma.permission.findMany();

  if (superAdminRole) {
    for (const perm of allPermissions) {
      await prisma.rolePermission.upsert({
        where: { role_id_permission_id: { role_id: superAdminRole.id, permission_id: perm.id } },
        update: {},
        create: { role_id: superAdminRole.id, permission_id: perm.id },
      });
    }
  }

  // Assign read permissions to viewer
  const viewerRole = await prisma.role.findUnique({ where: { name: 'viewer' } });
  const readPermissions = allPermissions.filter((p) => p.action === 'read');

  if (viewerRole) {
    for (const perm of readPermissions) {
      await prisma.rolePermission.upsert({
        where: { role_id_permission_id: { role_id: viewerRole.id, permission_id: perm.id } },
        update: {},
        create: { role_id: viewerRole.id, permission_id: perm.id },
      });
    }
  }

  // Seed default super admin user
  console.log('👤 Seeding default super admin user...');
  const hashedPassword = await argon2.hash('Admin@123');
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@fams.id' },
    update: {},
    create: {
      username: 'superadmin',
      email: 'admin@fams.id',
      password: hashedPassword,
      full_name: 'Super Administrator',
      phone: '+6281234567890',
      status: UserStatus.ACTIVE,
    },
  });

  if (superAdminRole) {
    await prisma.userRole.upsert({
      where: { user_id_role_id: { user_id: adminUser.id, role_id: superAdminRole.id } },
      update: {},
      create: { user_id: adminUser.id, role_id: superAdminRole.id },
    });
  }

  // Seed Masters
  await seedMasters();

  console.log('\n🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
