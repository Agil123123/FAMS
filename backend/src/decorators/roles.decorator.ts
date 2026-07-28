// ==========================================================
// Roles Decorator
// Usage: @Roles('asset.read', 'asset.create')
// ==========================================================

import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...permissions: string[]) =>
  SetMetadata(ROLES_KEY, permissions);
