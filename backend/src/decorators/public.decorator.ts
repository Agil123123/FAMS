// ==========================================================
// Public Decorator
// Usage: @Public() — skips JWT guard
// ==========================================================

import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
