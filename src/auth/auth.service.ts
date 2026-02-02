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
    // Busca o funcionário pelo email e traz os dados da Role
    const user = await this.prisma.funcionario.findUnique({
      where: { email },
      include: {
        role: true,
      },
    });

    //Validando existência e senha
    if (!user) {
      throw new UnauthorizedException('E-mail ou senha incorretos');
    }

    const passwordMatches = await bcrypt.compare(senhaPlana, user.senha);

    if (!passwordMatches) {
      throw new UnauthorizedException('E-mail ou senha incorretos');
    }

  
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role.nome,
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
