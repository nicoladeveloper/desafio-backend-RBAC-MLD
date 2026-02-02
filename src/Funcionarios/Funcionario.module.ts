import { Module } from '@nestjs/common';
import { UsersService } from './Funcionario.service';
import { UsersController } from './Funcionario.controller';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
