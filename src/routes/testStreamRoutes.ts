import { FastifyInstance } from 'fastify';
import { testStreamController } from '../controllers/testStreamController';

export async function testStreamRoutes(app: FastifyInstance): Promise<void> {
  app.get('/', {
    handler: testStreamController.serve.bind(testStreamController),
  });
}
