import { FastifyInstance } from 'fastify';

import { isAddress } from '../../../lib/utils/validators';
import {
  error,
  ERROR_ADR_INVALID,
  ERROR_INCORRECT_SIGNED_NONCE,
  ERROR_INTERNAL,
  ERROR_INVALID_SIGNATURE,
} from '../../../lib/utils/error-messages';
import { JWT_VALIDITY_TIME } from '../../../environment/config';
import { logError } from '../../../lib/logger';
import { getAddressSiwe, handleAuthorizationWithSignature } from './auth.service';

export async function authRoutes(fastify: FastifyInstance) {
  fastify.route({
    method: 'GET',
    url: '/:address/siwe',
    schema: {
      description: 'Get the current nonce of a specific user.',
      tags: ['auth'],
      summary: 'Get a user nonce',
      querystring: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'Path of the URI' },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const { address } = request.params as { address: string };
        const { path } = request.query as { path?: string };
        if (!isAddress(address)) return reply.code(400).send(error(400, ERROR_ADR_INVALID));

        const { message, issuedAt } = await getAddressSiwe(address, path);
        return reply.code(200).send({ message, issuedAt });
      } catch (e: any) {
        logError(e);
        return reply.code(500).send(error(500, ERROR_INTERNAL));
      }
    },
  });

  //   fastify.route({
  //   method: 'POST',
  //   url: '/:userAddress/signature',
  //   schema: {
  //     description: 'Request a JWT by sending a signed nonce.',
  //     tags: ['auth'],
  //     summary: 'Request for JWT',
  //     body: {
  //       type: 'object',
  //       required: ['signedNonce'],
  //       properties: {
  //         signedNonce: {type: 'string', description: 'Nonce signed by the user'}
  //       }
  //     }
  //   },
  //   handler: async (request, reply) => {
  //     const {userAddress} = request.params as { userAddress: string };
  //     const {signedNonce} = request.body as { signedNonce: string };
  //
  //     logMessage(signedNonce);
  //
  //     try {
  //       if (!isAddress(userAddress)) return reply.code(400).send(error(400, ERROR_ADR_INVALID));
  //       let nonce: string = await queryNonce(userAddress);
  //
  //       if (generateAddressWithSignature('I want to log in to lookso.io. \nMy address: ' + userAddress + '\nMy nonce: ' + nonce, signedNonce).toUpperCase() !== userAddress.toUpperCase()) return reply.code(403).send(error(403, ERROR_INCORRECT_SIGNED_NONCE));
  //       // User is auth
  //
  //       await updateNonce(userAddress);
  //
  //       const jwtToken = fastify.jwt.sign({ address: userAddress }, { expiresIn: JWT_VALIDITY_TIME + 'h' });
  //       const date = new Date();
  //       date.setTime(date.getTime() + JWT_VALIDITY_TIME * 60 * 60 * 1000) // 6 hours from now
  //
  //       return reply.setCookie('token', jwtToken,{
  //         path: '/',
  //         expires: date,
  //         httpOnly: true,
  //         secure: true,
  //         signed: true,
  //         sameSite: true
  //       }).code(200).send('JWT successfully set in cookies');
  //
  //     } catch (e: any) {
  //       logError(e);
  //       if (e.message.includes('Invalid signature')) return reply.code(400).send(error(400, ERROR_INVALID_SIGNATURE));
  //       else return reply.code(500).send(error(500, ERROR_INTERNAL));
  //     }
  //   }
  // });

  fastify.route({
    method: 'POST',
    url: '/:address/controller-signature',
    schema: {
      description: 'Request a JWT by sending a signed nonce from a controller address.',
      tags: ['auth'],
      summary: 'Request for a Universal Profile JWT',
      body: {
        type: 'object',
        required: ['signedMessage', 'issuedAt'],
        properties: {
          signedMessage: { type: 'string', description: 'Message signed by the user' },
          issuedAt: {
            type: 'string',
            description: 'Date in ISO format when the message to sign has been sent to the user',
          },
          path: { type: 'string', description: 'Path of the URI' },
        },
      },
    },
    handler: async (request, reply) => {
      const { address } = request.params as { address: string };
      const { signedMessage, issuedAt, path } = request.body as {
        signedMessage: string;
        issuedAt: string;
        path?: string;
      };

      if (!isAddress(address)) return reply.code(400).send(error(400, ERROR_ADR_INVALID));

      try {
        const expirationDate = await handleAuthorizationWithSignature(
          address,
          issuedAt,
          signedMessage,
          path,
        );

        const jwtToken = fastify.jwt.sign(
          { address: address },
          { expiresIn: JWT_VALIDITY_TIME + 'h' },
        );

        return reply
          .setCookie('token', jwtToken, {
            path: '/',
            expires: expirationDate,
            secure: true,
            httpOnly: true,
            signed: true,
            sameSite: true,
          })
          .code(200)
          .send('JWT successfully set in cookies');
      } catch (e: any) {
        logError(e);

        if (JSON.stringify(e).includes(ERROR_INCORRECT_SIGNED_NONCE))
          return reply.code(403).send(error(403, ERROR_INCORRECT_SIGNED_NONCE));

        if (JSON.stringify(e).includes('Invalid signature'))
          return reply.code(400).send(error(400, ERROR_INVALID_SIGNATURE));
        else return reply.code(500).send(error(500, ERROR_INTERNAL));
      }
    },
  });
}
