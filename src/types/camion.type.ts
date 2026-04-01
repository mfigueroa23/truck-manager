import { Estado } from '../generated/prisma/client.js';

export type Camion = {
  id?: number;
  patente: string;
  marca: string;
  modelo: string;
  carga: string;
  conductorId: number;
  estado?: Estado;
};

export type CreateCamion = {
  patente: string;
  marca: string;
  modelo: string;
  carga: string;
  conductor: string;
  estado?: Estado;
};

export type UpdateCamion = {
  patente?: string;
  marca?: string;
  modelo?: string;
  carga?: string;
  conductor?: string;
  estado?: Estado;
};
