import { Module } from '@nestjs/common';
import { EmpresaService } from './empresa.service.js';
import { EmpresaController } from './empresa.controller.js';
import { PrismaService } from '../prisma.service.js';

@Module({
  controllers: [EmpresaController],
  providers: [EmpresaService, PrismaService],
})
export class EmpresaModule {}
