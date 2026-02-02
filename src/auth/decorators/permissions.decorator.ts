import { SetMetadata } from '@nestjs/common';

export const PERMISSION_KEY = 'permissions';

export const CheckPermission = (
  resource: string,
  action: string,
  scope: 'own' | 'all',
) => SetMetadata(PERMISSION_KEY, { resource, action, scope });
