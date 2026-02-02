import { SetMetadata } from '@nestjs/common';

export const PERMISSION_KEY = 'permissions';

// Define o formato Resource:Action:Scope que você solicitou
export const CheckPermission = (
  resource: string,
  action: string,
  scope: 'own' | 'all',
) => SetMetadata(PERMISSION_KEY, { resource, action, scope });
