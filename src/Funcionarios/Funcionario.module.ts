import { Module } from '@nestjs/common';
import { UsersService } from './Funcionario.service';
import { UsersController } from './Funcionario.controller';
import { RolesController } from './roles.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UsersController, RolesController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
