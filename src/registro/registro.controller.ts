import { Controller, Get, Logger, Post, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { RegistroService } from './registro.service.js';

@Controller('registro')
export class RegistroController {
  private readonly logger = new Logger(RegistroController.name);
  constructor(private registroService: RegistroService) {}

  @Get()
  async getRegistros(@Res() res: Response) {
    try {
      this.logger.log('Solicitud para obtener registros de acceso');
      const registros = await this.registroService.getRegistros();
      return res.status(200).json(registros);
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(
        `A ocurrido un error al obtener los registros: ${error.message}`,
      );
      return res.status(500).json({
        message: 'Error al obtener los registros',
        error: error.message,
      });
    }
  }

  @Post()
  async registrar(@Query('rfid') rfid: string, @Res() res: Response) {
    try {
      if (!rfid) {
        return res.status(400).json({ message: 'El query param rfid es requerido' });
      }
      this.logger.log(`Solicitud de registro para rfid: ${rfid}`);
      const registro = await this.registroService.registrarPorRfid(rfid);
      return res.status(201).json(registro);
    } catch (err) {
      const error = new Error(err as string);
      if (error.message.includes('Conductor no encontrado')) {
        this.logger.warn(`No se encontró el conductor: ${error.message}`);
        return res.status(404).json({ message: error.message });
      }
      if (error.message.includes('No se encontró ningún camión')) {
        this.logger.warn(`No se encontró el camión: ${error.message}`);
        return res.status(404).json({ message: error.message });
      }
      if (error.message.includes('No se encontró un registro de salida abierto')) {
        this.logger.warn(`Registro abierto no encontrado: ${error.message}`);
        return res.status(409).json({ message: error.message });
      }
      if (error.message.includes('Tiempo mínimo entre registros no cumplido')) {
        this.logger.warn(`Registro rechazado por tiempo mínimo: ${error.message}`);
        return res.status(429).json({ message: error.message });
      }
      this.logger.error(
        `A ocurrido un error al procesar el registro: ${error.message}`,
      );
      return res.status(500).json({
        message: 'Error al procesar el registro',
        error: error.message,
      });
    }
  }
}
