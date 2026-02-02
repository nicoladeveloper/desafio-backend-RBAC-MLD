import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // Este Guard apenas diz ao NestJS para usar a estratégia 'jwt' 
  // que configuramos no arquivo jwt.strategy.ts
}