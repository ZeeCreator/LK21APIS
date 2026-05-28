import { FastifyRequest, FastifyReply } from 'fastify';
import { ZodSchema, ZodError } from 'zod';
import { sendError } from '../utils/response';

export function validate(
  schema: ZodSchema,
  source: 'body' | 'query' | 'params' = 'body'
): (request: FastifyRequest, reply: FastifyReply) => Promise<void> {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      const data = schema.parse(request[source]);
      (request as unknown as Record<string, unknown>)[source] = data;
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors.map(
          (e) => `${e.path.join('.')}: ${e.message}`
        );
        sendError(reply, 400, messages.join('; '));
        return;
      }
      sendError(reply, 400, 'Validation failed');
    }
  };
}
