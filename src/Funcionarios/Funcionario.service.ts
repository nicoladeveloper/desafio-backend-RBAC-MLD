import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

export interface UserPayload {
  sub: string;
  id?: string; 
  email: string;
  role: string;
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto, currentUser: UserPayload) {
    const userExists = await this.prisma.funcionario.findUnique({
      where: { email: createUserDto.email },
    });

    if (userExists) {
      throw new ConflictException('Este e-mail já está cadastrado.');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.senha, 10);

    //ID DO CRIADOR, (padrão JWT) ou 'id'
    const creatorId = currentUser.sub || currentUser.id;

    return this.prisma.funcionario.create({
      data: {
        ...createUserDto,
        senha: hashedPassword,
        createdById: creatorId, 
      },
      select: {
        id: true,
        nome: true,
        email: true,
        roleId: true,
        createdById: true,
      },
    });
  }

  async findAll(currentUser: UserPayload) {
    const userId = currentUser.sub || currentUser.id;

    if (currentUser.role === 'ADMIN') {
      return this.prisma.funcionario.findMany({
        include: { role: true },
      });
    }

    // Usuário comum vê apenas a si mesmo
    return this.prisma.funcionario.findMany({
      where: { id: userId },
      include: { role: true },
    });
  }

  async findOne(id: string, currentUser: UserPayload) {
    const userId = currentUser.sub || currentUser.id;

    if (currentUser.role !== 'ADMIN' && userId !== id) {
      throw new ForbiddenException(
        'Acesso negado: você só pode ver seu próprio perfil.',
      );
    }

    const user = await this.prisma.funcionario.findUnique({
      where: { id },
      include: { role: { include: { permissions: true } } },
    });

    if (!user) {
      throw new NotFoundException(`Funcionário com ID ${id} não encontrado`);
    }

    return user;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    currentUser: UserPayload,
  ) {
    const userId = currentUser.sub || currentUser.id;

    if (currentUser.role !== 'ADMIN' && userId !== id) {
      throw new ForbiddenException('Você não pode editar outros funcionários.');
    }

    if (currentUser.role !== 'ADMIN' && updateUserDto.roleId) {
      throw new ForbiddenException(
        'Você não tem permissão para alterar cargos.',
      );
    }

    if (updateUserDto.senha) {
      updateUserDto.senha = await bcrypt.hash(updateUserDto.senha, 10);
    }

    try {
      return await this.prisma.funcionario.update({
        where: { id },
        data: updateUserDto,
        select: { id: true, nome: true, email: true, roleId: true },
      });
    } catch {
      throw new NotFoundException(
        `Erro ao atualizar: Funcionário não encontrado`,
      );
    }
  }

  async remove(id: string, currentUser: UserPayload) {
    if (currentUser.role !== 'ADMIN') {
      throw new ForbiddenException(
        'Apenas administradores podem remover funcionários.',
      );
    }

    try {
      await this.prisma.funcionario.delete({ where: { id } });
      return { message: 'Funcionário removido com sucesso' };
    } catch {
      throw new NotFoundException(
        `Erro ao remover: Funcionário não encontrado`,
      );
    }
  }
}
