import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service'; // Ajuste o caminho se necessário
import { PERMISSION_KEY } from '../decorators/permissions.decorator';
import { Scope } from '@prisma/client'; // Importante para bater com o tipo do banco

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Pega os metadados do decorator @CheckPermission
    const requiredPermission = this.reflector.get<{ resource: string, action: string, scope: string }>(
      PERMISSION_KEY,
      context.getHandler(),
    );

    if (!requiredPermission) return true;

    // 2. Pega o usuário do JwtGuard
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) throw new ForbiddenException('Usuário não autenticado');

    // 3. Busca no banco as permissões
    const funcionario = await this.prisma.funcionario.findUnique({
      where: { id: user.id },
      include: {
        role: {
          include: { permissions: true }
        },
      },
    });

    if (!funcionario || !funcionario.role) return false;

    // 4. Lógica de Validação Granular
    const hasPermission = funcionario.role.permissions.some((p) => {
      const isSameResource = p.resource === requiredPermission.resource;
      // Comparamos em maiúsculas para evitar erros de case-sensitivity
      const isSameAction =
        p.action.toUpperCase() === requiredPermission.action.toUpperCase();
      // Aqui usamos o Enum do Prisma para garantir a comparação correta
      // No banco é 'ALL' e 'OWN'. Se a permissão do user for ALL, ele passa.
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
