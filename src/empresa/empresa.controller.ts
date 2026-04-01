import {
  Controller,
  Get,
  Logger,
  Post,
  Res,
  Query,
  Delete,
  Put,
} from '@nestjs/common';
import { EmpresaService } from './empresa.service.js';
import type { Response } from 'express';

@Controller('empresa')
export class EmpresaController {
  private readonly logger = new Logger(EmpresaController.name);
  constructor(private empresaService: EmpresaService) {}
  @Get()
  async getAllEmpresas(
    @Query('id') id: string,
    @Query('nombre') nombre: string,
    @Res() res: Response,
  ) {
    try {
      if (nombre && id) {
        this.logger.warn(
          'No se pueden usar los parámetros id y nombre al mismo tiempo',
        );
        res.status(400).json({
          mensaje:
            'No se pueden usar los parámetros id y nombre al mismo tiempo',
        });
      } else if (id) {
        this.logger.log(`Solicitando la empresa con id ${id}`);
        const empresa = await this.empresaService.getEmpresaById(
          Number.parseInt(id),
        );
        if (!empresa) {
          this.logger.warn(`No se encontró la empresa con id ${id}`);
          res.status(404).json({
            mensaje: `No se encontró la empresa con id ${id}`,
          });
        }
        res.status(200).json(empresa);
      } else if (nombre) {
        this.logger.log(`Solicitando la empresa con nombre ${nombre}`);
        const empresa = await this.empresaService.getEmpresaByNombre(nombre);
        if (!empresa) {
          this.logger.warn(`No se encontró la empresa con nombre ${nombre}`);
          res.status(404).json({
            mensaje: `No se encontró la empresa con nombre ${nombre}`,
          });
        }
        res.status(200).json(empresa);
      } else {
        this.logger.log('Solicitando todas las empresas');
        const empresas = await this.empresaService.getAllEmpresas();
        res.status(200).json(empresas);
      }
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(
        `A ocurrido un error al obtener las empresas: ${error.message}`,
      );
      res.status(500).json({
        mensaje: 'A ocurrido un error al obtener las empresas',
        error: error.message,
      });
    }
  }
  @Post()
  async createEmpresa(@Query('nombre') nombre: string, @Res() res: Response) {
    try {
      this.logger.log('Solicitando crear una nueva empresa');
      if (!nombre) {
        this.logger.warn('El nombre de la empresa es requerido');
        res.status(400).json({
          mensaje: 'El nombre de la empresa es requerido',
        });
      }
      const empresaCreada = await this.empresaService.createEmpresa(nombre);
      res.status(201).json(empresaCreada);
    } catch (err) {
      const error = new Error(err as string);
      if (error.message.includes('Unique constraint')) {
        this.logger.warn(`La empresa con el nombre ${nombre} ya existe`);
        res.status(400).json({
          mensaje: `La empresa con el nombre ${nombre} ya existe`,
        });
      } else {
        this.logger.error(
          `A ocurrido un error al crear la empresa: ${error.message}`,
        );
        res.status(500).json({
          mensaje: 'A ocurrido un error al crear la empresa',
          error: error.message,
        });
      }
    }
  }
  @Put()
  async updateEmpresa(
    @Query('id') id: string,
    @Query('nombre') nombre: string,
    @Res() res: Response,
  ) {
    try {
      if (!id) {
        this.logger.warn('El id de la empresa es requerido');
        res.status(400).json({
          mensaje: 'El id de la empresa es requerido',
        });
      } else if (!nombre) {
        this.logger.warn('El nombre de la empresa es requerido');
        res.status(400).json({
          mensaje: 'El nombre de la empresa es requerido',
        });
      } else {
        this.logger.log(`Solicitando actualizar la empresa con id ${id}`);
        const empresaActualizada = await this.empresaService.updateEmpresa(
          Number.parseInt(id),
          nombre,
        );
        if (!empresaActualizada) {
          this.logger.warn(`No se encontró la empresa con id ${id}`);
          res.status(404).json({
            mensaje: `No se encontró la empresa con id ${id}`,
          });
        }
        res.status(200).json(empresaActualizada);
      }
    } catch (err) {
      const error = new Error(err as string);
      if (error.message.includes('Unique constraint')) {
        this.logger.warn(`La empresa con el nombre ${nombre} ya existe`);
        res.status(400).json({
          mensaje: `La empresa con el nombre ${nombre} ya existe`,
        });
      } else if (error.message.includes('No record was found for an update.')) {
        this.logger.warn(`No se encontró la empresa con id ${id}`);
        res.status(404).json({
          mensaje: `No se encontró la empresa con id ${id}`,
        });
      } else {
        this.logger.error(
          `A ocurrido un error al actualizar la empresa: ${error.message}`,
        );
        res.status(500).json({
          mensaje: 'A ocurrido un error al actualizar la empresa',
          error: error.message,
        });
      }
    }
  }
  @Delete()
  async deleteEmpresa(
    @Query('id') id: string,
    @Query('nombre') nombre: string,
    @Res() res: Response,
  ) {
    try {
      if (nombre && id) {
        this.logger.warn(
          'No se pueden usar los parámetros id y nombre al mismo tiempo',
        );
        res.status(400).json({
          mensaje:
            'No se pueden usar los parámetros id y nombre al mismo tiempo',
        });
      } else if (id) {
        this.logger.log(`Solicitando eliminar la empresa con id ${id}`);
        const empresaEliminada = await this.empresaService.deleteEmpresaById(
          Number.parseInt(id),
        );
        if (!empresaEliminada) {
          this.logger.warn(`No se encontró la empresa con id ${id}`);
          res.status(404).json({
            mensaje: `No se encontró la empresa con id ${id}`,
          });
        }
        res.status(200).json(empresaEliminada);
      } else if (nombre) {
        this.logger.log(`Solicitando eliminar la empresa con nombre ${nombre}`);
        const empresaEliminada =
          await this.empresaService.deleteEmpresaByNombre(nombre);
        if (!empresaEliminada) {
          this.logger.warn(`No se encontró la empresa con nombre ${nombre}`);
          res.status(404).json({
            mensaje: `No se encontró la empresa con nombre ${nombre}`,
          });
        }
        res.status(200).json(empresaEliminada);
      } else {
        this.logger.warn('Se requiere el parámetro id o nombre para eliminar');
        res.status(400).json({
          mensaje: 'Se requiere el parámetro id o nombre para eliminar',
        });
      }
    } catch (err) {
      const error = new Error(err as string);
      if (error.message.includes('No record was found for a delete.')) {
        this.logger.warn('No se encontró la empresa a eliminar');
        res.status(404).json({
          mensaje: 'No se encontró la empresa a eliminar',
        });
      } else {
        this.logger.error(
          `A ocurrido un error al eliminar la empresa: ${error.message}`,
        );
        res.status(500).json({
          mensaje: 'A ocurrido un error al eliminar la empresa',
          error: error.message,
        });
      }
    }
  }
}
