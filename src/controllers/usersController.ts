import { FastifyInstance } from 'fastify';
import {isAddress} from "../services/utils/validators";
import {insertUser, queryUser} from "../db/users";

import * as userSchema from '../models/json/user.json';
import {User} from "../models/types/user";

export async function usersController (fastify: FastifyInstance) {

    fastify.route({
      method: 'POST',
      url: '/',
      schema: {
        body: userSchema,
        response: {200: userSchema}
      },
      handler: async (request, reply) => {
        try {
          const user = request.body as User;
          if (await queryUser(user.address)) return reply.code(400).send('User already exists');
          await insertUser(user.address, user.selectedProfile);
          return reply.code(200).send(user);
        } catch (e: any) {
          return reply.code(500).send('Internal Error');
        }
      }
    });

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

}
