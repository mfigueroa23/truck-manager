import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';

@Injectable()
export class EmpresaService {
  constructor(private prisma: PrismaService) {}
  private readonly logger = new Logger(EmpresaService.name);
  async getAllEmpresas() {
    try {
      this.logger.log('Obteniendo todas las empresas');
      const empresas = await this.prisma.empresa.findMany();
      return empresas;
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(
        `A ocurrido un error al obtener las empresas: ${error.message}`,
      );
      throw err;
    }
  }
  async getEmpresaById(id: number) {
    try {
      this.logger.log(`Obteniendo la empresa con id ${id}`);
      const empresa = await this.prisma.empresa.findUnique({
        where: {
          id,
        },
      });
      return empresa;
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(
        `A ocurrido un error al obtener la empresa con id ${id}: ${error.message}`,
      );
      throw err;
    }
  }
  async getEmpresaByNombre(nombre: string) {
    try {
      this.logger.log(`Obteniendo la empresa con nombre ${nombre}`);
      const empresa = await this.prisma.empresa.findUnique({
        where: {
          nombre,
        },
      });
      return empresa;
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(
        `A ocurrido un error al obtener la empresa con nombre ${nombre}: ${error.message}`,
      );
      throw err;
    }
  }
  async createEmpresa(nombre: string) {
    try {
      this.logger.log('Creando una nueva empresa');
      const empresa = await this.prisma.empresa.create({
        data: {
          nombre,
        },
      });
      return empresa;
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(
        `A ocurrido un error al crear la empresa: ${error.message}`,
      );
      throw err;
    }
  }
  async updateEmpresa(id: number, nombre: string) {
    try {
      this.logger.log(`Actualizando la empresa con id ${id}`);
      const empresa = await this.prisma.empresa.update({
        where: {
          id,
        },
        data: {
          nombre,
        },
      });
      return empresa;
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(
        `A ocurrido un error al actualizar la empresa con id ${id}: ${error.message}`,
      );
      throw err;
    }
  }
  async deleteEmpresaById(id: number) {
    try {
      this.logger.log(`Eliminando la empresa con id ${id}`);
      const empresa = await this.prisma.empresa.delete({
        where: {
          id,
        },
      });
      return empresa;
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(
        `A ocurrido un error al eliminar la empresa con id ${id}: ${error.message}`,
      );
      throw err;
    }
  }
  async deleteEmpresaByNombre(nombre: string) {
    try {
      this.logger.log(`Eliminando la empresa con nombre ${nombre}`);
      const empresa = await this.prisma.empresa.delete({
        where: {
          nombre,
        },
      });
      return empresa;
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(
        `A ocurrido un error al eliminar la empresa con nombre ${nombre}: ${error.message}`,
      );
      throw err;
    }
  }
}
