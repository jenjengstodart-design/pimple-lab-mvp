import { z } from 'zod';
import { experiments, dailyCheckins } from './schema';

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() }),
};

export const api = {
  experiments: {
    create: {
      method: 'POST' as const,
      path: '/api/experiments' as const,
      input: z.object({
        age: z.coerce.number(),
        stressLevel: z.coerce.number(),
        makeup: z.boolean(),
        sportFrequency: z.string(),
        menstrualCyclePhase: z.string().optional(),
        imageBase64: z.string(), // base64 data URL
      }),
      responses: {
        201: z.custom<typeof experiments.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/experiments/:id' as const,
      responses: {
        200: z.custom<typeof experiments.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/experiments/:id' as const,
      input: z.object({
        routineDescription: z.string().optional(),
        durationDays: z.coerce.number().optional(),
        acneType: z.string().optional(), // allow user to override
      }),
      responses: {
        200: z.custom<typeof experiments.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    analyze: {
      method: 'POST' as const,
      path: '/api/experiments/:id/analyze' as const,
      responses: {
        200: z.any(), // AnalysisResponse
        404: errorSchemas.notFound,
      }
    },
    followUp: {
      method: 'POST' as const,
      path: '/api/experiments/:id/follow-up' as const,
      input: z.object({
        imageBase64: z.string(),
        outcome: z.string(), // better, same, worse
      }),
      responses: {
        200: z.custom<typeof experiments.$inferSelect>(),
        404: errorSchemas.notFound,
      }
    },
    getCheckins: {
      method: 'GET' as const,
      path: '/api/experiments/:id/checkins' as const,
      responses: {
        200: z.array(z.custom<typeof dailyCheckins.$inferSelect>()),
      }
    },
    addCheckin: {
      method: 'POST' as const,
      path: '/api/experiments/:id/checkins' as const,
      input: z.object({
        dayNumber: z.coerce.number(),
        adherence: z.coerce.number(),
        stressLevel: z.coerce.number(),
        makeup: z.boolean(),
      }),
      responses: {
        201: z.custom<typeof dailyCheckins.$inferSelect>(),
        400: errorSchemas.validation,
      }
    },
  },
  products: {
    list: {
      method: 'GET' as const,
      path: '/api/products' as const,
      input: z.object({ acneType: z.string().optional() }).optional(),
      responses: {
        200: z.array(z.any()), // array of Product
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
