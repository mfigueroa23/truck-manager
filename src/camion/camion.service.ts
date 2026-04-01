import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { Camion } from '../types/camion.type.js';
import { Estado } from '../generated/prisma/client.js';

@Injectable()
export class CamionService {
  private readonly logger = new Logger(CamionService.name);
  constructor(private prisma: PrismaService) {}

  async getAllCamiones() {
    try {
      this.logger.log('Obteniendo todos los camiones');
      const camiones = await this.prisma.camion.findMany({
        include: { conductor: true },
      });
      return camiones;
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(
        `A ocurrido un error al obtener los camiones: ${error.message}`,
      );
      throw err;
    }
  }

  async getCamionById(id: number) {
    try {
      this.logger.log(`Obteniendo camion por id: ${id}`);
      const camion = await this.prisma.camion.findUnique({
        where: { id },
        include: { conductor: true },
      });
      return camion;
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(
        `A ocurrido un error al obtener el camion por id: ${error.message}`,
      );
      throw err;
    }
  }

  async getCamionByPatente(patente: string) {
    try {
      this.logger.log(`Obteniendo camion por patente: ${patente}`);
      const camion = await this.prisma.camion.findUnique({
        where: { patente },
        include: { conductor: true },
      });
      return camion;
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(
        `A ocurrido un error al obtener el camion por patente: ${error.message}`,
      );
      throw err;
    }
  }

  async getCamionesByConductor(conductorId: number) {
    try {
      this.logger.log(`Obteniendo camiones por conductorId: ${conductorId}`);
      const camiones = await this.prisma.camion.findMany({
        where: { conductorId },
        include: { conductor: true },
      });
      return camiones;
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(
        `A ocurrido un error al obtener los camiones por conductor: ${error.message}`,
      );
      throw err;
    }
  }

  async getCamionesByEstado(estado: Estado) {
    try {
      this.logger.log(`Obteniendo camiones por estado: ${estado}`);
      const camiones = await this.prisma.camion.findMany({
        where: { estado },
        include: { conductor: true },
      });
      return camiones;
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(
        `A ocurrido un error al obtener los camiones por estado: ${error.message}`,
      );
      throw err;
    }
  }

  async createCamion(camion: Camion) {
    try {
      this.logger.log(`Creando nuevo camion con patente: ${camion.patente}`);
      const newCamion = await this.prisma.camion.create({
        data: { ...camion },
        include: { conductor: true },
      });
      return newCamion;
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(
        `A ocurrido un error al crear el camion: ${error.message}`,
      );
      throw err;
    }
  }

  async updateCamion(id: number, camion: Partial<Camion>) {
    try {
      this.logger.log(`Actualizando camion con id: ${id}`);
      if (camion.patente) {
        this.logger.warn(
          'No se puede actualizar la patente del camion, esta operación no está permitida',
        );
        throw new Error(
          'No se puede actualizar la patente del camion, esta operación no está permitida',
        );
      }
      const updatedCamion = await this.prisma.camion.update({
        where: { id },
        data: { ...camion },
        include: { conductor: true },
      });
      return updatedCamion;
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(
        `A ocurrido un error al actualizar el camion: ${error.message}`,
      );
      throw err;
    }
  }

  async deleteCamionById(id: number) {
    try {
      this.logger.log(`Eliminando camion con id: ${id}`);
      await this.prisma.camion.delete({ where: { id } });
      return;
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(
        `A ocurrido un error al eliminar el camion: ${error.message}`,
      );
      throw err;
    }
  }

  async deleteCamionByPatente(patente: string) {
    try {
      this.logger.log(`Eliminando camion con patente: ${patente}`);
      await this.prisma.camion.delete({ where: { patente } });
      return;
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(
        `A ocurrido un error al eliminar el camion: ${error.message}`,
      );
      throw err;
    }
  }
}
