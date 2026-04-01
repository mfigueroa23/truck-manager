import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { Conductor } from '../types/conductor.type.js';

@Injectable()
export class ConductorService {
  private readonly logger = new Logger(ConductorService.name);
  constructor(private prisma: PrismaService) {}
  async getAllConductores() {
    try {
      this.logger.log('Obteniendo todos los conductores');
      const conductores = await this.prisma.conductor.findMany({
        include: { empresa: true },
      });
      return conductores;
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(
        `A ocurrido un error al obtener los conductores: ${error.message}`,
      );
      throw err;
    }
  }
  async getConductorById(id: string) {
    try {
      this.logger.log(`Obteniendo conductor por id: ${id}`);
      const conductor = await this.prisma.conductor.findUnique({
        where: { id: parseInt(id) },
        include: { empresa: true },
      });
      return conductor;
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(
        `A ocurrido un error al obtener el conductor por id: ${error.message}`,
      );
      throw err;
    }
  }
  async getConductorByRut(rut: string) {
    try {
      this.logger.log(`Obteniendo conductor por rut: ${rut}`);
      const conductor = await this.prisma.conductor.findUnique({
        where: { rut },
        include: { empresa: true },
      });
      return conductor;
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(
        `A ocurrido un error al obtener el conductor por rut: ${error.message}`,
      );
      throw err;
    }
  }
  async getConductoresByEmpresa(empresa: string) {
    try {
      this.logger.log(`Obteniendo conductores por empresa: ${empresa}`);
      const conductores = await this.prisma.conductor.findMany({
        where: { empresa: { nombre: empresa } },
        include: { empresa: true },
      });
      return conductores;
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(
        `A ocurrido un error al obtener los conductores por empresa: ${error.message}`,
      );
      throw err;
    }
  }
  async createConductor(conductor: Conductor) {
    try {
      this.logger.log(
        `Creando nuevo conductor: ${conductor.nombre} ${conductor.apellido}`,
      );
      const newConductor = await this.prisma.conductor.create({
        data: { ...conductor },
        include: { empresa: true },
      });
      return newConductor;
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(
        `A ocurrido un error al crear el conductor: ${error.message}`,
      );
      throw err;
    }
  }
  async updateConductor(id: number, conductor: Partial<Conductor>) {
    try {
      this.logger.log(`Actualizando conductor con id: ${id}`);
      if (conductor.rut) {
        this.logger.warn(
          'No se puede actualizar el rut del conductor, esta operación no está permitida',
        );
        throw new Error(
          'No se puede actualizar el rut del conductor, esta operación no está permitida',
        );
      }
      const updatedConductor = await this.prisma.conductor.update({
        where: { id },
        data: { ...conductor },
        include: { empresa: true },
      });
      return updatedConductor;
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(
        `A ocurrido un error al actualizar el conductor: ${error.message}`,
      );
      throw err;
    }
  }
  async deleteConductorById(id: number) {
    try {
      this.logger.log(`Eliminando conductor con id: ${id}`);
      await this.prisma.conductor.delete({ where: { id } });
      return;
    } catch (err) {
      const error = new Error(err as string);
      this.logger.log(
        `A ocurrido un error al eliminar el conductor: ${error.message}`,
      );
      throw err;
    }
  }
  async deleteConductorByRut(rut: string) {
    try {
      this.logger.log(`Eliminando conductor con rut: ${rut}`);
      await this.prisma.conductor.delete({ where: { rut } });
      return;
    } catch (err) {
      const error = new Error(err as string);
      this.logger.log(
        `A ocurrido un error al eliminar el conductor: ${error.message}`,
      );
      throw err;
    }
  }
}
