import { Module } from '@nestjs/common';
import { RegistroService } from './registro.service.js';
import { RegistroController } from './registro.controller.js';
import { PrismaService } from '../prisma.service.js';
import { CamionService } from '../camion/camion.service.js';

@Module({
  controllers: [RegistroController],
  providers: [RegistroService, CamionService, PrismaService],
})
export class RegistroModule {}
