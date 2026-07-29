// ==========================================================
// RBAC Guard
// Checks user permissions against @Roles() decorator metadata
// ==========================================================

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Skip if route is public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    // Get required permissions from decorator
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no specific permissions required, allow access
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    // Get user from request
    const { user } = context.switchToHttp().getRequest();
    if (!user || !user.permissions) {
      throw new ForbiddenException('Access denied: No permissions found');
    }

    // Check if user has the required role (case-insensitive)
    const hasRole = requiredPermissions.some((role: string) =>
      user.roles.some((userRole: string) => userRole.toLowerCase() === role.toLowerCase()),
    );

    if (!hasRole) {
      throw new ForbiddenException(
        `Access denied: Required roles [${requiredPermissions.join(', ')}]`,
      );
    }

    return true;
  }
}
