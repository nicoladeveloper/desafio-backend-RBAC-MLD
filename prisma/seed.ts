import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Limpando banco de dados...');
  await prisma.funcionario.deleteMany();
  await prisma.role.deleteMany();
  await prisma.permission.deleteMany();

  console.log('Criando Permissões...');
  const pReadOwn = await prisma.permission.create({ data: { resource: 'employees', action: 'READ' as any, scope: 'OWN' as any } });
  const pReadAll = await prisma.permission.create({ data: { resource: 'employees', action: 'READ' as any, scope: 'ALL' as any } });
  const pCreateAll = await prisma.permission.create({ data: { resource: 'employees', action: 'CREATE' as any, scope: 'ALL' as any } });
  const pUpdateOwn = await prisma.permission.create({ data: { resource: 'employees', action: 'UPDATE' as any, scope: 'OWN' as any } });
  const pUpdateAll = await prisma.permission.create({ data: { resource: 'employees', action: 'UPDATE' as any, scope: 'ALL' as any } });
  const pDeleteAll = await prisma.permission.create({ data: { resource: 'employees', action: 'DELETE' as any, scope: 'ALL' as any } });

  console.log('Criando Roles...');
  const adminRole = await prisma.role.create({
    data: {
      nome: 'ADMIN',
      permissions: {
        connect: [
          { id: pReadAll.id },
          { id: pCreateAll.id },
          { id: pUpdateAll.id },
          { id: pDeleteAll.id },
        ],
      },
    },
  });

  await prisma.role.create({
    data: {
      nome: 'READER',
      permissions: {
        connect: [{ id: pReadOwn.id }, { id: pUpdateOwn.id }],
      },
    },
  });

  console.log('Criando Admin Master...');
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const master = await prisma.funcionario.create({
    data: {
      nome: 'Administrador Master',
      email: 'admin@empresa.com',
      senha: hashedPassword,
      roleId: adminRole.id,
    },
  });

  console.log(`Seed Finalizado! Admin ID: ${master.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
