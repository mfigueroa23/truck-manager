import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { EmpresaModule } from './empresa/empresa.module.js';
import { PrismaService } from './prisma.service.js';
import { ConductorModule } from './conductor/conductor.module.js';
import { CamionModule } from './camion/camion.module.js';

@Module({
  imports: [EmpresaModule, ConductorModule, CamionModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
