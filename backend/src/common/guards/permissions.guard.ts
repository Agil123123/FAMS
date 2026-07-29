import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredPermissions) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    // Super admin overrides all permissions (case-insensitive)
    if (user && user.roles && user.roles.some((r: string) => r.toLowerCase() === 'super_admin')) {
      return true;
    }

    if (!user || !user.permissions) {
      throw new ForbiddenException('Access denied. Insufficient permissions.');
    }

    const hasPermission = requiredPermissions.every((permission) => 
      user.permissions.includes(permission)
    );
    
    if (!hasPermission) {
      throw new ForbiddenException('Access denied. Insufficient permissions.');
    }

    return true;
  }
}
