import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Restricts a route (or controller) to the given roles. Combine with
 * JwtAuthGuard + RolesGuard, e.g. `@Roles('admin')` or `@Roles('admin', 'agent')`.
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
