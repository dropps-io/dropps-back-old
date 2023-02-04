import { FastifyInstance } from 'fastify';
import { SiweMessage } from 'siwe';

import { isAddress } from '../../bin/utils/validators';
import {
  error,
  ERROR_ADR_INVALID,
  ERROR_INCORRECT_SIGNED_NONCE,
  ERROR_INTERNAL,
  ERROR_INVALID_SIGNATURE,
} from '../../bin/utils/error-messages';
import { insertNonce, queryNonce, updateNonce } from '../../bin/db/nonces.table';
import { generateAddressWithSignature } from '../../bin/web3/auth';
import { FRONT_URL, IPFS_GATEWAY, JWT_VALIDITY_TIME } from '../../environment/config';
import { logError } from '../../bin/logger';
import { UniversalProfileReader } from '../../bin/UniversalProfile/UniversalProfileReader.class';
import { web3 } from '../../bin/web3/web3';

function createSiweMessage(address: string, issuedAt: string, path: string, nonce: string) {
  return new SiweMessage({
    domain: FRONT_URL.split('//')[1],
    address,
    statement: 'Welcome to LOOKSO!',
    uri: FRONT_URL + path,
    version: '1',
    chainId: 2828, // For LUKSO L16
    nonce,
    issuedAt,
  }).prepareMessage();
}

export async function authRoute(fastify: FastifyInstance) {
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
        let nonce: string = await queryNonce(address);
        if (!nonce) nonce = await insertNonce(address);

        const issuedAt = new Date().toISOString();
        const message = createSiweMessage(address, issuedAt, path ? path : '/', nonce);

        return reply.code(200).send({ message, issuedAt });
        /* eslint-disable */
      } catch (e: any) {
        logError(e);
        return reply.code(500).send(error(500, ERROR_INTERNAL));
      }
    }
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
  //       /* eslint-disable */
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
                  signedMessage: {type: 'string', description: 'Message signed by the user'},
                  issuedAt: {type: 'string', description: 'Date in ISO format when the message to sign has been sent to the user'},
                  path: {type: 'string', description: 'Path of the URI'},
                }
            }
        },
        handler: async (request, reply) => {
            const {address} = request.params as { address: string };
            const {signedMessage, issuedAt, path} = request.body as { signedMessage: string, issuedAt: string, path?: string };

            try {
              if (!isAddress(address)) return reply.code(400).send(error(400, ERROR_ADR_INVALID));
              const nonce: string = await queryNonce(address);
              const message = createSiweMessage(address, issuedAt, path ? path : '/', nonce);

              const controllerAddress = generateAddressWithSignature(message, signedMessage);
              const profile = new UniversalProfileReader(address, IPFS_GATEWAY, web3);
              const permissions = await profile.fetchPermissionsOf(controllerAddress);
              if (!(permissions && permissions.SIGN)) return reply.code(403).send(error(403, ERROR_INCORRECT_SIGNED_NONCE));
              // User is auth

              await updateNonce(address);

              let jwtToken = fastify.jwt.sign({ address: address }, { expiresIn: JWT_VALIDITY_TIME + 'h' });
              const date = new Date();
              date.setTime(date.getTime() + JWT_VALIDITY_TIME * 60 * 60 * 1000) // 6 hours from now

              return reply.setCookie('token', jwtToken,{
                path: '/',
                expires: date,
                secure: true,
                httpOnly: true,
                signed: true,
                sameSite: true
              }).code(200).send('JWT successfully set in cookies');
              /* eslint-disable */
            } catch (e: any) {
              logError(e);
              if (e.message && e.message.includes('Invalid signature')) return reply.code(400).send(error(400, ERROR_INVALID_SIGNATURE));
              else return reply.code(500).send(error(500, ERROR_INTERNAL));
            }
        }
    });
}
