import { Module } from '@nestjs/common';
import { ConductorService } from './conductor.service.js';
import { ConductorController } from './conductor.controller.js';
import { PrismaService } from '../prisma.service.js';
import { EmpresaService } from '../empresa/empresa.service.js';

@Module({
  controllers: [ConductorController],
  providers: [ConductorService, EmpresaService, PrismaService],
})
export class ConductorModule {}
