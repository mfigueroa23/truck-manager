# Truck Manager API

API REST para la gestión de empresas, conductores, camiones y registro de accesos en tiempo real. Construida con **NestJS**, **Prisma** y **PostgreSQL**.

---

## Requisitos

- Node.js >= 20
- PostgreSQL
- npm

---

## Levantar el proyecto

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/truck_manager"
PORT=3000
```

### 3. Ejecutar migraciones

```bash
npx prisma migrate dev
```

### 4. Iniciar el servidor

```bash
# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod
```

El servidor queda disponible en `http://localhost:3000`.

---

## Módulos y Endpoints

### Empresa

#### `GET /empresa`

Retorna empresas. Acepta un filtro a la vez.

| Query param | Tipo | Descripción |
|---|---|---|
| `id` | number | Buscar por ID |
| `nombre` | string | Buscar por nombre |

Sin parámetros retorna todas las empresas.

**Respuesta `200`**
```json
[{ "id": 1, "nombre": "LogiCargo S.A." }]
```

**Errores**
| Código | Causa |
|---|---|
| `400` | Más de un filtro enviado simultáneamente |
| `404` | Empresa no encontrada |

---

#### `POST /empresa`

Crea una empresa.

| Query param | Tipo | Requerido |
|---|---|---|
| `nombre` | string | Sí |

**Respuesta `201`**
```json
{ "id": 1, "nombre": "LogiCargo S.A." }
```

**Errores**
| Código | Causa |
|---|---|
| `400` | Nombre no enviado |
| `409` | Ya existe una empresa con ese nombre |

---

#### `PUT /empresa`

Actualiza el nombre de una empresa.

| Query param | Tipo | Descripción |
|---|---|---|
| `id` | number | ID de la empresa a actualizar |
| `nombre` | string | Nuevo nombre |

**Respuesta `200`** — empresa actualizada.

**Errores**
| Código | Causa |
|---|---|
| `400` | Faltan parámetros |
| `404` | Empresa no encontrada |

---

#### `DELETE /empresa`

Elimina una empresa. Acepta `id` o `nombre` como query param.

**Respuesta `200`** — empresa eliminada.

**Errores**
| Código | Causa |
|---|---|
| `400` | Ningún filtro enviado |
| `404` | Empresa no encontrada |

---

### Conductor

#### `GET /conductor`

Retorna conductores. Acepta un filtro a la vez.

| Query param | Tipo | Descripción |
|---|---|---|
| `id` | number | Buscar por ID |
| `rut` | string | Buscar por RUT |
| `empresa` | string | Filtrar por nombre de empresa |

Sin parámetros retorna todos los conductores.

**Respuesta `200`**
```json
[{
  "id": 1,
  "nombre": "Carlos",
  "apellido": "Muñoz",
  "rut": "14.823.441-K",
  "rfid": "abcd-1234",
  "empresaId": 1,
  "empresa": { "id": 1, "nombre": "LogiCargo S.A." }
}]
```

**Errores**
| Código | Causa |
|---|---|
| `400` | Más de un filtro enviado simultáneamente |
| `404` | Conductor no encontrado |

---

#### `POST /conductor`

Crea un conductor.

**Body JSON**
```json
{
  "nombre": "Carlos",
  "apellido": "Muñoz",
  "rut": "14.823.441-K",
  "rfid": "abcd-1234",
  "empresa": "LogiCargo S.A."
}
```

> `empresa` se recibe como nombre y se resuelve internamente al ID.

**Respuesta `201`** — conductor creado con empresa incluida.

**Errores**
| Código | Causa |
|---|---|
| `400` | Campos requeridos faltantes |
| `404` | Empresa no encontrada |
| `409` | RUT o RFID ya registrado |

---

#### `PATCH /conductor`

Actualiza un conductor. Acepta `id` o `rut` como query param. El RUT no puede modificarse.

**Body JSON** (todos opcionales)
```json
{
  "nombre": "Carlos",
  "apellido": "Muñoz",
  "rfid": "abcd-5678",
  "empresa": "OtraCarga S.A."
}
```

**Respuesta `200`** — conductor actualizado.

**Errores**
| Código | Causa |
|---|---|
| `400` | Ningún filtro enviado o intento de modificar el RUT |
| `404` | Conductor o empresa no encontrada |

---

#### `DELETE /conductor`

Elimina un conductor. Acepta `id` o `rut` como query param.

**Respuesta `200`** — conductor eliminado.

**Errores**
| Código | Causa |
|---|---|
| `400` | Ningún filtro enviado |
| `404` | Conductor no encontrado |

---

### Camión

#### `GET /camion`

Retorna camiones. Acepta un filtro a la vez.

| Query param | Tipo | Descripción |
|---|---|---|
| `id` | number | Buscar por ID |
| `patente` | string | Buscar por patente |
| `conductor` | string | Filtrar por RUT del conductor |
| `estado` | string | Filtrar por estado (`Disponible` / `Reparto`) |

Sin parámetros retorna todos los camiones.

**Respuesta `200`**
```json
[{
  "id": 1,
  "patente": "BCFT-79",
  "marca": "Volvo",
  "modelo": "FH16",
  "carga": "Materias primas",
  "estado": "Disponible",
  "conductorId": 1,
  "conductor": { ... }
}]
```

**Errores**
| Código | Causa |
|---|---|
| `400` | Más de un filtro enviado o estado inválido |
| `404` | Camión o conductor no encontrado |

---

#### `POST /camion`

Crea un camión.

**Body JSON**
```json
{
  "patente": "BCFT-79",
  "marca": "Volvo",
  "modelo": "FH16",
  "carga": "Materias primas",
  "conductor": "14.823.441-K",
  "estado": "Disponible"
}
```

> `conductor` se recibe como RUT y se resuelve internamente al ID. `estado` es opcional, por defecto `Disponible`.

**Respuesta `201`** — camión creado con conductor incluido.

**Errores**
| Código | Causa |
|---|---|
| `400` | Campos requeridos faltantes |
| `404` | Conductor no encontrado |
| `409` | Patente ya registrada |

---

#### `PATCH /camion`

Actualiza un camión. Acepta `id` o `patente` como query param. La patente no puede modificarse.

**Body JSON** (todos opcionales)
```json
{
  "marca": "Mercedes",
  "modelo": "Actros",
  "carga": "Combustible",
  "conductor": "12.345.678-9",
  "estado": "Reparto"
}
```

**Respuesta `200`** — camión actualizado.

**Errores**
| Código | Causa |
|---|---|
| `400` | Ningún filtro enviado o intento de modificar la patente |
| `404` | Camión o conductor no encontrado |

---

#### `DELETE /camion`

Elimina un camión. Acepta `id` o `patente` como query param.

**Respuesta `200`** — camión eliminado.

**Errores**
| Código | Causa |
|---|---|
| `400` | Ningún filtro enviado |
| `404` | Camión no encontrado |

---

### Registro de Accesos

#### `GET /registro`

Retorna el estado actual de todos los camiones con su último viaje registrado.

**Respuesta `200`**
```json
[{
  "patente": "BCFT-79",
  "conductor": {
    "nombre": "Carlos Muñoz",
    "rut": "14.823.441-K"
  },
  "empresa": "LogiCargo S.A.",
  "tipoCarga": "Materias primas",
  "salida": "2026-04-01T10:00:00.000Z",
  "ingreso": "2026-04-01T12:30:00.000Z",
  "estado": "Disponible"
}]
```

> `salida` e `ingreso` son `null` si aún no hay registros para ese camión. `ingreso` es `null` si el camión aún está en ruta.

**Errores**
| Código | Causa |
|---|---|
| `500` | Error interno del servidor |

---

#### `POST /registro?rfid=`

Registra un acceso a partir del RFID del conductor. Determina automáticamente si es una **salida** o una **entrada** según el estado actual del camión asignado.

| Query param | Tipo | Requerido |
|---|---|---|
| `rfid` | string | Sí |

**Lógica**
- Camión en `Disponible` → registra **salida**, actualiza estado a `Reparto`
- Camión en `Reparto` → registra **entrada**, actualiza estado a `Disponible`
- No se permiten dos registros con menos de **15 minutos** de diferencia

**Respuesta `201`**
```json
{
  "id": 5,
  "salidaAt": "2026-04-01T10:00:00.000Z",
  "entradaAt": null,
  "camionId": 1,
  "camion": { ... }
}
```

**Errores**
| Código | Causa |
|---|---|
| `400` | RFID no enviado |
| `404` | Conductor o camión no encontrado |
| `409` | No hay registro de salida abierto para cerrar |
| `429` | Han pasado menos de 15 minutos desde el último registro |
| `500` | Error interno del servidor |

---

## Stack

| Tecnología | Uso |
|---|---|
| NestJS 11 | Framework principal |
| Prisma 7 | ORM y migraciones |
| PostgreSQL | Base de datos |
| TypeScript | Lenguaje |
