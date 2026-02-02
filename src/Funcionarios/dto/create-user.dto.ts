import { IsEmail, IsString, MinLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    example: 'João Silva',
    description: 'Nome completo do funcionário',
  })
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiProperty({
    example: 'joao@empresa.com',
    description: 'E-mail institucional',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'senha123',
    minLength: 6,
    description: 'Senha de acesso',
  })
  @IsString()
  @MinLength(6)
  senha: string;

  @ApiProperty({
    example: 'id-da-role-aqui',
    description: 'O ID (UUID/CUID) do cargo/role cadastrado no banco' 
  })
  @IsString()
  @IsNotEmpty()
  roleId: string;
}
