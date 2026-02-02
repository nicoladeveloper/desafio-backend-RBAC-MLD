import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, senhaPlana: string) {
    // 1. Busca o funcionário pelo email e traz os dados da Role
    const user = await this.prisma.funcionario.findUnique({
      where: { email },
      include: {
        role: true, // Simplificado para pegar os dados da Role
      },
    });

    // 2. Valida existência e senha
    if (!user) {
      throw new UnauthorizedException('E-mail ou senha incorretos');
    }

    const passwordMatches = await bcrypt.compare(senhaPlana, user.senha);

    if (!passwordMatches) {
      throw new UnauthorizedException('E-mail ou senha incorretos');
    }

    // 3. CORREÇÃO DO PAYLOAD: 
    // Usamos 'nome' em vez de 'name' para bater com o banco de dados
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role.nome, // <--- Aqui estava o erro!
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        nome: user.nome,
        role: user.role.nome, // <--- Ajustado aqui também
      },
    };
  }
}
