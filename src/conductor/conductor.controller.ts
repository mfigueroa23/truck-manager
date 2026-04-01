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
import { ConductorService } from './conductor.service.js';
import type {
  Conductor,
  CreateConductor,
  UpdateConductor,
} from '../types/conductor.type.js';
import { EmpresaService } from '../empresa/empresa.service.js';

@Controller('conductor')
export class ConductorController {
  private readonly logger = new Logger(ConductorController.name);
  constructor(
    private conductorService: ConductorService,
    private empresaService: EmpresaService,
  ) {}
  @Get()
  async getAllConductores(
    @Query('id') id: string,
    @Query('rut') rut: string,
    @Query('empresa') empresa: string,
    @Res() res: Response,
  ) {
    try {
      if (id && rut && empresa) {
        this.logger.warn(
          'No se pueden usar los filtros id, rut y empresa al mismo tiempo',
        );
        return res.status(400).json({
          message:
            'No se pueden usar los filtros id, rut y empresa al mismo tiempo',
        });
      } else if (id) {
        this.logger.log(`Solicitud para obtener conductor por id: ${id}`);
        const conductor = await this.conductorService.getConductorById(id);
        return res.status(200).json(conductor);
      } else if (rut) {
        this.logger.log(`Solicitud para obtener conductor por rut: ${rut}`);
        const conductor = await this.conductorService.getConductorByRut(rut);
        return res.status(200).json(conductor);
      } else if (empresa) {
        this.logger.log(
          `Solicitud para obtener conductores por empresa: ${empresa}`,
        );
        const conductores =
          await this.conductorService.getConductoresByEmpresa(empresa);
        return res.status(200).json(conductores);
      } else {
        this.logger.log('Solicitud para obtener todos los conductores');
        const conductores = await this.conductorService.getAllConductores();
        return res.status(200).json(conductores);
      }
    } catch (err) {
      const error = new Error(err as string);
      this.logger.log(
        `A ocurrido un error al solicitar los conductores: ${error.message}`,
      );
      res.status(500).json({
        message: 'Error al obtener los conductores',
        error: error.message,
      });
    }
  }
  @Post()
  async createConductor(
    @Body() conductorData: CreateConductor,
    @Res() res: Response,
  ) {
    try {
      this.logger.log('Solicitud para crear un nuevo conductor');
      const empresa = await this.empresaService.getEmpresaByNombre(
        conductorData.empresa,
      );
      if (!empresa) {
        this.logger.warn(`No se encontró la empresa: ${conductorData.empresa}`);
        return res.status(404).json({
          message: `No se encontró la empresa: ${conductorData.empresa}`,
        });
      }
      const conductor: Conductor = {
        nombre: conductorData.nombre,
        apellido: conductorData.apellido,
        rut: conductorData.rut,
        rfid: conductorData.rfid,
        empresaId: empresa.id,
      };
      const newConductor =
        await this.conductorService.createConductor(conductor);
      this.logger.log(`Conductor creado con éxito: ${newConductor.id}`);
      res.status(201).json(newConductor);
    } catch (err) {
      const error = new Error(err as string);
      if (error.message.includes('Unique constraint failed')) {
        this.logger.warn(
          `El conductor con rut: ${conductorData.rut} ya existe`,
        );
        res.status(409).json({
          message: `El conductor con rut: ${conductorData.rut} ya existe`,
        });
      } else {
        this.logger.error(
          `A ocurrido un error al crear el conductor: ${error.message}`,
        );
        res.status(500).json({
          message: 'Error al crear el conductor',
          error: error.message,
        });
      }
    }
  }
  @Patch()
  async updateConductor(
    @Query('id') id: string,
    @Query('rut') rut: string,
    @Body() conductorData: UpdateConductor,
    @Res() res: Response,
  ) {
    try {
      if (id && rut) {
        this.logger.warn(
          'No se pueden usar los filtros id y rut al mismo tiempo',
        );
        res.status(400).json({
          message: 'No se pueden usar los filtros id y rut al mismo tiempo',
        });
      } else if (id) {
        this.logger.log(`Solicitud para actualizar conductor por id: ${id}`);
        if (conductorData.empresa) {
          const empresa = await this.empresaService.getEmpresaByNombre(
            conductorData.empresa,
          );
          if (!empresa) {
            this.logger.warn(
              `No se encontró la empresa: ${conductorData.empresa}`,
            );
            return res.status(404).json({
              message: `No se encontró la empresa: ${conductorData.empresa}`,
            });
          }
          const conductor: Partial<Conductor> = {
            ...conductorData,
            empresaId: empresa.id,
          };
          delete (conductor as UpdateConductor).empresa;
          const updatedConductor = await this.conductorService.updateConductor(
            Number.parseInt(id),
            conductor,
          );
          res.status(200).json(updatedConductor);
        } else {
          const conductor: Partial<Conductor> = { ...conductorData };
          const updatedConductor = await this.conductorService.updateConductor(
            Number.parseInt(id),
            conductor,
          );
          res.status(200).json(updatedConductor);
        }
      } else if (rut) {
        this.logger.log(`Solicitud para actualizar conductor por rut: ${rut}`);
        const conductorId = await this.conductorService.getConductorByRut(rut);
        if (!conductorId) {
          this.logger.warn(`No se encontró el conductor con rut: ${rut}`);
          return res.status(404).json({
            message: `No se encontró el conductor con rut: ${rut}`,
          });
        }
        if (conductorData.empresa) {
          const empresa = await this.empresaService.getEmpresaByNombre(
            conductorData.empresa,
          );
          if (!empresa) {
            this.logger.warn(
              `No se encontró la empresa: ${conductorData.empresa}`,
            );
            return res.status(404).json({
              message: `No se encontró la empresa: ${conductorData.empresa}`,
            });
          }
          const conductor: Partial<Conductor> = {
            ...conductorData,
            empresaId: empresa.id,
          };
          delete (conductor as UpdateConductor).empresa;
          const updatedConductor = await this.conductorService.updateConductor(
            conductorId.id,
            conductor,
          );
          res.status(200).json(updatedConductor);
        } else {
          const conductor: Partial<Conductor> = { ...conductorData };
          const updatedConductor = await this.conductorService.updateConductor(
            conductorId.id,
            conductor,
          );
          res.status(200).json(updatedConductor);
        }
      } else {
        this.logger.warn(
          'No se proporcionó un filtro para actualizar el conductor',
        );
        res.status(400).json({
          message: 'No se proporcionó un filtro para actualizar el conductor',
        });
      }
    } catch (err) {
      const error = new Error(err as string);
      if (
        error.message.includes('No se puede actualizar el rut del conductor')
      ) {
        res.status(400).json({
          message:
            'No se puede actualizar el rut del conductor, esta operación no está permitida',
        });
      } else {
        this.logger.log(
          `A ocurrido un error al actualizar el conductor: ${error.message}`,
        );
        res.status(500).json({
          message: 'Error al actualizar el conductor',
          error: error.message,
        });
      }
    }
  }
  @Delete()
  async deleteConductor(
    @Query('id') id: string,
    @Query('rut') rut: string,
    @Res() res: Response,
  ) {
    try {
      if (id && rut) {
        this.logger.warn(
          'No se pueden usar los filtros id y rut al mismo tiempo',
        );
        res.status(400).json({
          message: 'No se pueden usar los filtros id y rut al mismo tiempo',
        });
      } else if (id) {
        this.logger.log(`Solicitud para eliminar conductor por id: ${id}`);
        await this.conductorService.deleteConductorById(Number.parseInt(id));
        res.status(200).json({ message: 'Conductor eliminado con éxito' });
      } else if (rut) {
        this.logger.log(`Solicitud para eliminar conductor por rut: ${rut}`);
        await this.conductorService.deleteConductorByRut(rut);
        res.status(200).json({ message: 'Conductor eliminado con éxito' });
      } else {
        this.logger.warn(
          'No se proporcionó un filtro para eliminar el conductor',
        );
        res.status(400).json({
          message: 'No se proporcionó un filtro para eliminar el conductor',
        });
      }
    } catch (err) {
      const error = new Error(err as string);
      if (error.message.includes('No record was found for a delete.')) {
        this.logger.warn(`No se encontró el conductor para eliminar`);
        res.status(404).json({
          message: 'No se encontró el conductor para eliminar',
        });
      } else {
        this.logger.log(
          `A ocurrido un error al eliminar el conductor: ${error.message}`,
        );
        res.status(500).json({
          message: 'Error al eliminar el conductor',
          error: error.message,
        });
      }
    }
  }
}
