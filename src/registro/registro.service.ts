import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { CamionService } from '../camion/camion.service.js';
import { Estado } from '../generated/prisma/client.js';

const MINUTOS_MINIMOS = 15;

@Injectable()
export class RegistroService {
  private readonly logger = new Logger(RegistroService.name);
  constructor(
    private prisma: PrismaService,
    private camionService: CamionService,
  ) {}

  async getRegistros() {
    try {
      this.logger.log('Obteniendo registros de acceso');
      const camiones = await this.prisma.camion.findMany({
        include: {
          conductor: {
            include: { empresa: true },
          },
          registro: {
            orderBy: { salidaAt: 'desc' },
            take: 1,
          },
        },
      });

      return camiones.map((camion) => {
        const ultimo = camion.registro[0] ?? null;
        return {
          patente: camion.patente,
          conductor: {
            nombre: `${camion.conductor.nombre} ${camion.conductor.apellido}`,
            rut: camion.conductor.rut,
          },
          empresa: camion.conductor.empresa.nombre,
          tipoCarga: camion.carga,
          salida: ultimo?.salidaAt ?? null,
          ingreso: ultimo?.entradaAt ?? null,
          estado: camion.estado,
        };
      });
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(
        `A ocurrido un error al obtener los registros: ${error.message}`,
      );
      throw err;
    }
  }

  async registrarPorRfid(rfid: string) {
    try {
      this.logger.log(`Procesando registro para rfid: ${rfid}`);

      const conductor = await this.prisma.conductor.findUnique({
        where: { rfid },
      });
      if (!conductor) {
        this.logger.warn(`No se encontró el conductor con rfid: ${rfid}`);
        throw new Error(`Conductor no encontrado para rfid: ${rfid}`);
      }

      const camion = await this.prisma.camion.findFirst({
        where: { conductorId: conductor.id },
      });
      if (!camion) {
        this.logger.warn(
          `No se encontró ningún camión asignado al conductor con rfid: ${rfid}`,
        );
        throw new Error(
          `No se encontró ningún camión asignado al conductor con rfid: ${rfid}`,
        );
      }

      const ultimoRegistro = await this.prisma.registro.findFirst({
        where: { camionId: camion.id },
        orderBy: { salidaAt: 'desc' },
      });

      if (ultimoRegistro) {
        const ultimaAccion = ultimoRegistro.entradaAt ?? ultimoRegistro.salidaAt;
        const minutosDiferencia =
          (Date.now() - ultimaAccion.getTime()) / 1000 / 60;
        if (minutosDiferencia < MINUTOS_MINIMOS) {
          const minutosRestantes = Math.ceil(
            MINUTOS_MINIMOS - minutosDiferencia,
          );
          this.logger.warn(
            `Tiempo mínimo entre registros no cumplido para camión id ${camion.id}. Faltan ${minutosRestantes} minuto(s)`,
          );
          throw new Error(
            `Tiempo mínimo entre registros no cumplido. Faltan ${minutosRestantes} minuto(s)`,
          );
        }
      }

      if (camion.estado === Estado.Disponible) {
        // Salida: se crea un nuevo registro con salidaAt, entradaAt queda null
        const registro = await this.prisma.registro.create({
          data: { salidaAt: new Date(), camionId: camion.id },
          include: { camion: true },
        });
        await this.camionService.updateCamion(camion.id, {
          estado: Estado.Reparto,
        });
        this.logger.log(
          `Registro de salida creado para camión id ${camion.id}. Estado actualizado a Reparto`,
        );
        return registro;
      } else {
        // Entrada: se cierra el registro abierto (entradaAt null) con la hora actual
        const registroAbierto = await this.prisma.registro.findFirst({
          where: { camionId: camion.id, entradaAt: null },
          orderBy: { salidaAt: 'desc' },
        });
        if (!registroAbierto) {
          this.logger.warn(
            `No se encontró un registro de salida abierto para camión id ${camion.id}`,
          );
          throw new Error(
            `No se encontró un registro de salida abierto para el camión`,
          );
        }
        const registro = await this.prisma.registro.update({
          where: { id: registroAbierto.id },
          data: { entradaAt: new Date() },
          include: { camion: true },
        });
        await this.camionService.updateCamion(camion.id, {
          estado: Estado.Disponible,
        });
        this.logger.log(
          `Registro de entrada cerrado para camión id ${camion.id}. Estado actualizado a Disponible`,
        );
        return registro;
      }
    } catch (err) {
      const error = new Error(err as string);
      this.logger.error(
        `A ocurrido un error al registrar por rfid: ${error.message}`,
      );
      throw err;
    }
  }
}
