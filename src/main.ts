import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('API de Funcionários')
    .setDescription('Sistema de Autenticação e RBAC (Controle de Acesso)')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const prisma = app.get(PrismaService);
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@empresa.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

  const adminRole = await prisma.role.upsert({
    where: { nome: 'ADMIN' },
    update: {},
    create: { nome: 'ADMIN' },
  });

  const adminExists = await prisma.funcionario.findUnique({
    where: { email: adminEmail },
  });

  if (!adminExists) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await prisma.funcionario.create({
      data: {
        nome: process.env.ADMIN_NAME || 'Administrador Master',
        email: adminEmail,
        senha: hashedPassword,
        roleId: adminRole.id,
      },
    });
    console.log(' Usuário Admin padrão criado/verificado com sucesso!');
  }

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`Servidor rodando na porta: ${port}`);
}
bootstrap();
