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
    // 1. VALIDAÇÃO DE E-MAIL DUPLICADO
    const userExists = await this.prisma.funcionario.findUnique({
      where: { email: createUserDto.email },
    });

    if (userExists) {
      throw new ConflictException('Este e-mail já está cadastrado.');
    }

    // 2. VALIDAÇÃO DO ROLEID (EVITA ERRO 500)
    const roleExists = await this.prisma.role.findUnique({
      where: { id: createUserDto.roleId },
    });

    if (!roleExists) {
      throw new NotFoundException(
        `O cargo (roleId) ${createUserDto.roleId} não existe no sistema.`,
      );
    }

    // 3. CRIPTOGRAFIA E CRIAÇÃO
    const hashedPassword = await bcrypt.hash(createUserDto.senha, 10);
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

    // Valida se o cargo existe caso esteja sendo alterado
    if (updateUserDto.roleId) {
      if (currentUser.role !== 'ADMIN') {
        throw new ForbiddenException(
          'Você não tem permissão para alterar cargos.',
        );
      }
      const roleExists = await this.prisma.role.findUnique({
        where: { id: updateUserDto.roleId },
      });
      if (!roleExists) {
        throw new NotFoundException('O novo cargo informado não existe.');
      }
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
