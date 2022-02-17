import { FastifyInstance } from 'fastify';


export async function rootController (fastify: FastifyInstance) {
    fastify.route({
      method: 'POST',
      url: '/',
      handler: async (request, reply) => {
        return reply.code(200).send('Hello World');
      }
    });

  }
