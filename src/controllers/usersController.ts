import { FastifyInstance } from 'fastify';
import {isAddress} from "../services/utils/validators";
import {insertUser, queryUser, updateUser} from "../db/users";

import * as userSchema from '../models/json/user.json';
import {User} from "../models/types/user";
import {getPermissions} from "../services/universal-profiles";
import {
  ADR_INVALID,
  ADR_NOT_EQUAL_PARAM_BODY,
  INTERNAL,
  UP_NO_PERMISSIONS, USER_EXISTS,
  USER_NOT_FOUND
} from "../services/utils/error-messages";

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
          if (!await getPermissions(user.selectedProfile, user.address)) return reply.code(403).send(UP_NO_PERMISSIONS);
          await insertUser(user.address, user.selectedProfile);
          return reply.code(200).send(user);
        } catch (e: any) {
          console.error(e);
          if (e.sqlState === '23000') return reply.code(422).send(USER_EXISTS);
          return reply.code(500).send(INTERNAL);
        }
      }
    });

    fastify.route({
      method: 'GET',
      url: '/:address',
      handler: async (request, reply) => {
        try {
          const {address} = request.params as { address: string };
          if (!isAddress(address)) return reply.code(400).send(ADR_INVALID);
          const user = await queryUser(address);
          if (!user) return reply.code(404).send(USER_NOT_FOUND);
          return  reply.code(200).send(user);
        } catch (e: any) {
          return reply.code(500).send(INTERNAL);
        }
      }
    });

  fastify.route({
    method: 'PUT',
    url: '/:address',
    schema: {
      body: userSchema,
      response: {200: userSchema}
    },
    handler: async (request, reply) => {
      try {
        const {address} = request.params as { address: string };
        const user = request.body as User;

        if (!isAddress(address)) return reply.code(400).send(ADR_INVALID);
        if (address.toUpperCase() !== user.address.toUpperCase()) return reply.code(400).send(ADR_NOT_EQUAL_PARAM_BODY);
        if (!await getPermissions(user.selectedProfile, user.address)) return reply.code(403).send(UP_NO_PERMISSIONS);

        await updateUser(user.address, user.selectedProfile);
        return  reply.code(200).send(user);
      } catch (e: any) {
        if (e === USER_NOT_FOUND) return reply.code(404).send(e);
        return reply.code(500).send(INTERNAL);
      }
    }
  });
}
