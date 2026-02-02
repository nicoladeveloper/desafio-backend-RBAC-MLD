<p align="center">
  <a href="http://nestjs.com/" target="blank">
    <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" />
  </a>
</p>

<h1 align="center">Desafio Backend RBAC - MLD</h1>

<p align="center">
  API desenvolvida com NestJS, Prisma e PostgreSQL  com Autenticação JWT com Passport para gerenciamento de funcionários com controle de acesso baseado em funções (RBAC - Role-Based Access Control).
</p>

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT" />
  <img src="https://img.shields.io/badge/Passport-34E27A?style=for-the-badge&logo=passport&logoColor=white" alt="Passport" />
  <img src="https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black" alt="Swagger" />
</p>

## Descrição

Sistema de gerenciamento de funcionários com autenticação JWT e controle de acesso baseado em funções (RBAC), permitindo diferentes níveis de permissões para administradores e usuários comuns.

## Links

- **API Base URL**: [https://desafio-backend-rbac-mld.onrender.com](https://desafio-backend-rbac-mld.onrender.com)
- **Documentação Swagger**: [https://desafio-backend-rbac-mld.onrender.com/api](https://desafio-backend-rbac-mld.onrender.com/api)

## Acesso para Testes

O banco de dados foi populado automaticamente com um administrador master:

- E-mail: admin@empresa.com
- Senha: Admin@123

##  Features

- Autenticação JWT com Passport
- Controle de acesso baseado em funções (RBAC)
- CRUD completo de funcionários
- Gerenciamento de permissões granulares
- Sistema de auditoria (createdBy, createdAt, updatedAt)
- Relação N–N entre usuários e permissões
- Guards personalizados para validação de permissões
- Documentação automática com Swagger
- Validação de dados com class-validator
- Tratamento de erros centralizado

## Permissões Disponíveis

O sistema implementa as seguintes permissões:

- `READ` - Visualizar funcionários
- `CREATE` - Criar novos funcionários
- `UPDATE` - Atualizar funcionários existentes
- `DELETE` - Remover funcionários
