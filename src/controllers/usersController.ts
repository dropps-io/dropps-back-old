import { FastifyInstance } from 'fastify';
import {isAddress} from "../services/utils/validators";
import {queryUser} from "../db/users";


export async function usersController (fastify: FastifyInstance) {

    fastify.route({
      method: 'GET',
      url: '/:address',
      handler: async (request, reply) => {
        try {
          const {address} = request.params as { address: string };
          if (!isAddress(address)) return reply.code(400).send('Invalid address');
          const user = await queryUser(address);
          if (!user) return reply.code(404).send('User not found');
          return  reply.code(200).send(user);
        } catch (e: any) {
          return reply.code(500).send('Internal Error');
        }
      }
    });
  //
  // fastify.route({
  //   method: 'POST',
  //   url: '/:address',
  //   handler: async (request, reply) => {
  //     try {
  //       const {address} = request.params as { address: string };
  //       if (!isAddress(address)) return reply.code(400).send('Invalid address');
  //       const user = await queryUser(address);
  //       await reply.code(200).send(user);
  //     } catch (e: any) {
  //       return reply.code(500).send('Internal Error');
  //     }
  //   }
  // });
}
