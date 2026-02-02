import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Request } from 'express'; // Importação essencial para tipagem
import { UsersService, UserPayload } from './Funcionario.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

// Guards e Decorators
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { CheckPermission } from '../auth/decorators/permissions.decorator';

// Interface ajustada para evitar conflitos de tipo
interface RequestWithUser extends Request {
  user: UserPayload;
}

@ApiTags('Funcionários')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('funcionarios')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @CheckPermission('employees', 'CREATE', 'all')
  @ApiOperation({ summary: 'Criar novo funcionário (Admin apenas)' })
  create(@Body() createUserDto: CreateUserDto, @Req() req: RequestWithUser) {
    // LOG DE DEPURAÇÃO: Verifique o terminal após enviar o POST pelo Swagger
    console.log('Dados do usuário no Token:', req.user);
    // Passamos o req.user para o service preencher o createdById
    return this.usersService.create(createUserDto, req.user);
  }

  @Get()
  @CheckPermission('employees', 'READ', 'all')
  @ApiOperation({ summary: 'Listar funcionários (Escopo filtrado no Service)' })
  findAll(@Req() req: RequestWithUser) {
    return this.usersService.findAll(req.user);
  }

  @Get(':id')
  @CheckPermission('employees', 'READ', 'own')
  @ApiOperation({ summary: 'Ver detalhes de um funcionário' })
  findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.usersService.findOne(id, req.user);
  }

  @Patch(':id')
  @CheckPermission('employees', 'UPDATE', 'own')
  @ApiOperation({ summary: 'Atualizar funcionário (Próprio ou Admin)' })
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: RequestWithUser,
  ) {
    return this.usersService.update(id, updateUserDto, req.user);
  }

  @Delete(':id')
  @CheckPermission('employees', 'DELETE', 'all')
  @ApiOperation({ summary: 'Remover funcionário (Admin apenas)' })
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.usersService.remove(id, req.user);
  }
}
