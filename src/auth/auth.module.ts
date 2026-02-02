import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [
    JwtModule.register({
      // Certifique-se de que essa secret seja a mesma no JwtStrategy
      secret: process.env.JWT_SECRET || 'chave-secreta-muito-forte',
      signOptions: { 
        expiresIn: (process.env.JWT_EXPIRATION || '1d') as any,
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy, // ADICIONADO: Necessário para o Nest injetar a estratégia de validação
    PrismaService, // ADICIONADO: Necessário para o AuthService consultar o banco
  ],
  exports: [AuthService], // Geralmente apenas o AuthService é necessário fora daqui
})
export class AuthModule {}
