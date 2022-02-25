import { FastifyInstance } from 'fastify';
import {queryUser} from "../db/mysql";


export async function usersController (fastify: FastifyInstance) {

    fastify.route({
      method: 'GET',
      url: '/:address',
      handler: async (request, reply) => {
        try {
          const {address} = request.params as { address: string };
          const user = await queryUser(address);
          await reply.code(200).send(user);
        } catch (e: any) {
          return reply.code(500).send('Internal Error');
        }
      }
    });

}
