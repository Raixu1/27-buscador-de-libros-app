import { z } from "zod";

// Contratos de las respuestas de la API. Se validan al recibirlas: si el servidor responde algo distinto,
// la app muestra un error en lugar de guardar datos con forma incorrecta.

const estado = z.enum(["quiero", "leyendo", "leido"]);

export const libroSchema = z.object({
  id: z.string(),
  titulo: z.string(),
  autores: z.array(z.string()),
  portada_url: z.string().nullable(),
  anio: z.number().nullable(),
});

export const lecturaRemotaSchema = libroSchema.extend({
  estado,
  calificacion: z.number().nullable(),
  nota: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  deleted_at: z.string().nullable(),
});

export const tokensSchema = z.object({ token: z.string(), refreshToken: z.string(), expiraEnSeg: z.number() });

export const sesionSchema = tokensSchema.extend({ usuario: z.object({ id: z.string(), email: z.string() }) });

export const paginaLibrosSchema = z.object({
  resultados: z.array(libroSchema),
  total: z.number(),
  pagina: z.number(),
  hay_mas: z.boolean(),
});

export const sinopsisSchema = z.object({ id: z.string(), descripcion: z.string().nullable() });

export const cambiosSchema = z.object({ items: z.array(lecturaRemotaSchema), servidor_ahora: z.string() });

export const okSchema = z.object({ ok: z.literal(true) });
