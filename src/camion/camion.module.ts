import { Module } from '@nestjs/common';
import { CamionService } from './camion.service.js';
import { CamionController } from './camion.controller.js';
import { PrismaService } from '../prisma.service.js';
import { ConductorService } from '../conductor/conductor.service.js';

@Module({
  controllers: [CamionController],
  providers: [CamionService, ConductorService, PrismaService],
})
export class CamionModule {}
