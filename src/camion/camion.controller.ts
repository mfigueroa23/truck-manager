import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { CamionService } from './camion.service.js';
import type {
  Camion,
  CreateCamion,
  UpdateCamion,
} from '../types/camion.type.js';
import { ConductorService } from '../conductor/conductor.service.js';
import { Estado } from '../generated/prisma/client.js';

@Controller('camion')
export class CamionController {
  private readonly logger = new Logger(CamionController.name);
  constructor(
    private camionService: CamionService,
    private conductorService: ConductorService,
  ) {}

  @Get()
  async getAllCamiones(
    @Query('id') id: string,
    @Query('patente') patente: string,
    @Query('conductor') conductor: string,
    @Query('estado') estado: string,
    @Res() res: Response,
  ) {
    try {
      const filtros = [id, patente, conductor, estado].filter(Boolean).length;
      if (filtros > 1) {
        this.logger.warn('Solo se puede usar un filtro a la vez');
        return res.status(400).json({
          message: 'Solo se puede usar un filtro a la vez',
        });
      } else if (id) {
        this.logger.log(`Solicitud para obtener camion por id: ${id}`);
        const camion = await this.camionService.getCamionById(
          Number.parseInt(id),
        );
        if (!camion) {
          return res.status(404).json({
            message: `No se encontró el camion con id: ${id}`,
          });
        }
        return res.status(200).json(camion);
      } else if (patente) {
        this.logger.log(
          `Solicitud para obtener camion por patente: ${patente}`,
        );
        const camion = await this.camionService.getCamionByPatente(patente);
        if (!camion) {
          return res.status(404).json({
            message: `No se encontró el camion con patente: ${patente}`,
          });
        }
        return res.status(200).json(camion);
      } else if (conductor) {
        this.logger.log(
          `Solicitud para obtener camiones por conductor rut: ${conductor}`,
        );
        const conductorEncontrado =
          await this.conductorService.getConductorByRut(conductor);
        if (!conductorEncontrado) {
          return res.status(404).json({
            message: `No se encontró el conductor con rut: ${conductor}`,
          });
        }
        const camiones = await this.camionService.getCamionesByConductor(
          conductorEncontrado.id,
        );
        return res.status(200).json(camiones);
      } else if (estado) {
        if (!Object.values(Estado).includes(estado as Estado)) {
          this.logger.warn(`Estado inválido: ${estado}`);
          return res.status(400).json({
            message: `Estado inválido: ${estado}. Los valores permitidos son: ${Object.values(Estado).join(', ')}`,
          });
        }
        this.logger.log(
          `Solicitud para obtener camiones por estado: ${estado}`,
        );
        const camiones = await this.camionService.getCamionesByEstado(
          estado as Estado,
        );
        return res.status(200).json(camiones);
      } else {
        this.logger.log('Solicitud para obtener todos los camiones');
        const camiones = await this.camionService.getAllCamiones();
        return res.status(200).json(camiones);
      }
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(
        `A ocurrido un error al obtener los camiones: ${error.message}`,
      );
      return res.status(500).json({
        message: 'Error al obtener los camiones',
        error: error.message,
      });
    }
  }

  @Post()
  async createCamion(@Body() camionData: CreateCamion, @Res() res: Response) {
    try {
      this.logger.log('Solicitud para crear un nuevo camion');
      if (
        !camionData.patente ||
        !camionData.marca ||
        !camionData.modelo ||
        !camionData.carga ||
        !camionData.conductor
      ) {
        return res.status(400).json({
          message:
            'Los campos patente, marca, modelo, carga y conductor son requeridos',
        });
      }
      const conductorEncontrado = await this.conductorService.getConductorByRut(
        camionData.conductor,
      );
      if (!conductorEncontrado) {
        this.logger.warn(
          `No se encontró el conductor con rut: ${camionData.conductor}`,
        );
        return res.status(404).json({
          message: `No se encontró el conductor con rut: ${camionData.conductor}`,
        });
      }
      const camion: Camion = {
        patente: camionData.patente,
        marca: camionData.marca,
        modelo: camionData.modelo,
        carga: camionData.carga,
        conductorId: conductorEncontrado.id,
        ...(camionData.estado && { estado: camionData.estado }),
      };
      const newCamion = await this.camionService.createCamion(camion);
      this.logger.log(`Camion creado con éxito: ${newCamion.id}`);
      return res.status(201).json(newCamion);
    } catch (err) {
      const error = new Error(err as string);
      if (error.message.includes('Unique constraint failed')) {
        this.logger.warn(
          `El camion con patente: ${camionData.patente} ya existe`,
        );
        return res.status(409).json({
          message: `El camion con patente: ${camionData.patente} ya existe`,
        });
      }
      this.logger.error(
        `A ocurrido un error al crear el camion: ${error.message}`,
      );
      return res.status(500).json({
        message: 'Error al crear el camion',
        error: error.message,
      });
    }
  }

  @Patch()
  async updateCamion(
    @Query('id') id: string,
    @Query('patente') patente: string,
    @Body() camionData: UpdateCamion,
    @Res() res: Response,
  ) {
    try {
      if (id && patente) {
        this.logger.warn(
          'No se pueden usar los filtros id y patente al mismo tiempo',
        );
        return res.status(400).json({
          message: 'No se pueden usar los filtros id y patente al mismo tiempo',
        });
      }

      let camionId: number | undefined;

      if (id) {
        camionId = Number.parseInt(id);
      } else if (patente) {
        const camionEncontrado =
          await this.camionService.getCamionByPatente(patente);
        if (!camionEncontrado) {
          this.logger.warn(`No se encontró el camion con patente: ${patente}`);
          return res.status(404).json({
            message: `No se encontró el camion con patente: ${patente}`,
          });
        }
        camionId = camionEncontrado.id;
      } else {
        this.logger.warn(
          'No se proporcionó un filtro para actualizar el camion',
        );
        return res.status(400).json({
          message: 'No se proporcionó un filtro para actualizar el camion',
        });
      }

      const camionActualizado: Partial<Camion> = { ...camionData };

      if (camionData.conductor) {
        const conductorEncontrado =
          await this.conductorService.getConductorByRut(camionData.conductor);
        if (!conductorEncontrado) {
          this.logger.warn(
            `No se encontró el conductor con rut: ${camionData.conductor}`,
          );
          return res.status(404).json({
            message: `No se encontró el conductor con rut: ${camionData.conductor}`,
          });
        }
        camionActualizado.conductorId = conductorEncontrado.id;
        delete (camionActualizado as UpdateCamion).conductor;
      }

      this.logger.log(`Solicitud para actualizar camion con id: ${camionId}`);
      const updatedCamion = await this.camionService.updateCamion(
        camionId,
        camionActualizado,
      );
      return res.status(200).json(updatedCamion);
    } catch (err) {
      const error = new Error(err as string);
      if (
        error.message.includes('No se puede actualizar la patente del camion')
      ) {
        return res.status(400).json({
          message:
            'No se puede actualizar la patente del camion, esta operación no está permitida',
        });
      } else if (error.message.includes('No record was found for an update.')) {
        this.logger.warn('No se encontró el camion a actualizar');
        return res.status(404).json({
          message: 'No se encontró el camion a actualizar',
        });
      }
      this.logger.error(
        `A ocurrido un error al actualizar el camion: ${error.message}`,
      );
      return res.status(500).json({
        message: 'Error al actualizar el camion',
        error: error.message,
      });
    }
  }

  @Delete()
  async deleteCamion(
    @Query('id') id: string,
    @Query('patente') patente: string,
    @Res() res: Response,
  ) {
    try {
      if (id && patente) {
        this.logger.warn(
          'No se pueden usar los filtros id y patente al mismo tiempo',
        );
        return res.status(400).json({
          message: 'No se pueden usar los filtros id y patente al mismo tiempo',
        });
      } else if (id) {
        this.logger.log(`Solicitud para eliminar camion por id: ${id}`);
        await this.camionService.deleteCamionById(Number.parseInt(id));
        return res.status(200).json({ message: 'Camion eliminado con éxito' });
      } else if (patente) {
        this.logger.log(
          `Solicitud para eliminar camion por patente: ${patente}`,
        );
        await this.camionService.deleteCamionByPatente(patente);
        return res.status(200).json({ message: 'Camion eliminado con éxito' });
      } else {
        this.logger.warn('No se proporcionó un filtro para eliminar el camion');
        return res.status(400).json({
          message: 'No se proporcionó un filtro para eliminar el camion',
        });
      }
    } catch (err) {
      const error = new Error(err as string);
      if (error.message.includes('No record was found for a delete.')) {
        this.logger.warn('No se encontró el camion para eliminar');
        return res.status(404).json({
          message: 'No se encontró el camion para eliminar',
        });
      }
      this.logger.error(
        `A ocurrido un error al eliminar el camion: ${error.message}`,
      );
      return res.status(500).json({
        message: 'Error al eliminar el camion',
        error: error.message,
      });
    }
  }
}
