import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { EmpresaModule } from './empresa/empresa.module.js';
import { PrismaService } from './prisma.service.js';

@Module({
  imports: [EmpresaModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
