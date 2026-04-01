export type Conductor = {
  id?: number;
  nombre: string;
  apellido: string;
  rut: string;
  rfid: string;
  empresaId: number;
};

export type CreateConductor = {
  nombre: string;
  apellido: string;
  rut: string;
  rfid: string;
  empresa: string;
};

export type UpdateConductor = {
  nombre?: string;
  apellido?: string;
  rut?: string;
  rfid?: string;
  empresa?: string;
};
