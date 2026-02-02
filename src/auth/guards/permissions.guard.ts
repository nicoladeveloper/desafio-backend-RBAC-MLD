import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { PERMISSION_KEY } from '../decorators/permissions.decorator';
import { Scope } from '@prisma/client';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    //Pega os metadados do decorator @CheckPermission
    const requiredPermission = this.reflector.get<{ resource: string, action: string, scope: string }>(
      PERMISSION_KEY,
      context.getHandler(),
    );

    if (!requiredPermission) return true;

    //Pega o usuário do JwtGuard
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) throw new ForbiddenException('Usuário não autenticado');

    //Busca no banco as permissões
    const funcionario = await this.prisma.funcionario.findUnique({
      where: { id: user.id },
      include: {
        role: {
          include: { permissions: true }
        },
      },
    });

    if (!funcionario || !funcionario.role) return false;

    // Validação Granular
    const hasPermission = funcionario.role.permissions.some((p) => {
      const isSameResource = p.resource === requiredPermission.resource;
      const isSameAction =
        p.action.toUpperCase() === requiredPermission.action.toUpperCase();
      const hasCorrectScope =
        p.scope === Scope.ALL ||
        p.scope.toString().toUpperCase() ===
          requiredPermission.scope.toUpperCase();

      return isSameResource && isSameAction && hasCorrectScope;
    });

    if (!hasPermission) {
      throw new ForbiddenException(
        'Você não tem permissão para realizar esta ação',
      );
    }

    return true;
  }
}
