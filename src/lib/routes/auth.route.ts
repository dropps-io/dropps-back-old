import {isAddress} from '../../bin/utils/validators';
import {
	error, ERROR_ADR_INVALID,
	ERROR_INCORRECT_SIGNED_NONCE,
	ERROR_INTERNAL,
	ERROR_INVALID_SIGNATURE
} from '../../bin/utils/error-messages';
import {insertNonce, queryNonce, updateNonce} from '../../bin/db/nonces.table';
import {generateAddressWithSignature} from '../../bin/web3/auth';
import {generateJWT} from '../../bin/json-web-token';
import {FastifyInstance} from 'fastify';
import {IPFS_GATEWAY, JWT_VALIDITY_TIME} from '../../environment/config';
import {logError, logMessage} from '../../bin/logger';
import {UniversalProfileReader} from "../../bin/UniversalProfile/UniversalProfileReader.class";
import {web3} from "../../bin/web3/web3";
import { HOST } from '../../environment/endpoints';

export async function authRoute (fastify: FastifyInstance) {

	fastify.route({
		method: 'GET',
		url: '/:userAddress/nonce',
		schema: {
			description: 'Get the current nonce of a specific user.',
			tags: ['auth'],
			summary: 'Get a user nonce',
		},
		handler: async (request, reply) => {
			try {
				const {userAddress} = request.params as { userAddress: string };
				if (!isAddress(userAddress)) return reply.code(400).send(error(400, ERROR_ADR_INVALID));
				let nonce: string = await queryNonce(userAddress);
				if (!nonce) nonce = await insertNonce(userAddress);
				return reply.code(200).send({nonce: 'I want to log in to lookso.io. \nMy address: ' + userAddress + '\nMy nonce: ' + nonce});
				/* eslint-disable */
      } catch (e: any) {
        logError(e);
        return reply.code(500).send(error(500, ERROR_INTERNAL));
      }
    }
  });

    fastify.route({
    method: 'POST',
    url: '/:userAddress/signature',
    schema: {
      description: 'Request a JWT by sending a signed nonce.',
      tags: ['auth'],
      summary: 'Request for JWT',
      body: {
        type: 'object',
        required: ['signedNonce'],
        properties: {
          signedNonce: {type: 'string', description: 'Nonce signed by the user'}
        }
      }
    },
    handler: async (request, reply) => {
      const {userAddress} = request.params as { userAddress: string };
      const {signedNonce} = request.body as { signedNonce: string };

      logMessage(signedNonce);

      try {
        if (!isAddress(userAddress)) return reply.code(400).send(error(400, ERROR_ADR_INVALID));
        let nonce: string = await queryNonce(userAddress);

        if (generateAddressWithSignature('I want to log in to lookso.io. \nMy address: ' + userAddress + '\nMy nonce: ' + nonce, signedNonce).toUpperCase() !== userAddress.toUpperCase()) return reply.code(403).send(error(403, ERROR_INCORRECT_SIGNED_NONCE));
        // User is auth

        await updateNonce(userAddress);

        return reply.code(200).send({
          token: generateJWT(userAddress),
          userAddress: userAddress,
          message: 'Token valid for ' + JWT_VALIDITY_TIME + 'h'
        });
        /* eslint-disable */
      } catch (e: any) {
        logError(e);
        if (e.message.includes('Invalid signature')) return reply.code(400).send(error(400, ERROR_INVALID_SIGNATURE));
        else return reply.code(500).send(error(500, ERROR_INTERNAL));
      }
    }
  });

    fastify.route({
        method: 'POST',
        url: '/:userAddress/controller-signature',
        schema: {
            description: 'Request a JWT by sending a signed nonce from a controller address.',
            tags: ['auth'],
            summary: 'Request for a Universal Profile JWT',
            body: {
                type: 'object',
                required: ['signedNonce'],
                properties: {
                    signedNonce: {type: 'string', description: 'Nonce signed by the user'}
                }
            }
        },
        handler: async (request, reply) => {
            const {userAddress} = request.params as { userAddress: string };
            const {signedNonce} = request.body as { signedNonce: string };

            try {
                if (!isAddress(userAddress)) return reply.code(400).send(error(400, ERROR_ADR_INVALID));
                let nonce: string = await queryNonce(userAddress);

                const controllerAddress = generateAddressWithSignature('I want to log in to lookso.io. \nMy address: ' + userAddress + '\nMy nonce: ' + nonce, signedNonce);
                const profile = new UniversalProfileReader(userAddress, IPFS_GATEWAY, web3);

                //if (!await profile.fetchPermissionsOf(controllerAddress)) return reply.code(403).send(error(403, ERROR_INCORRECT_SIGNED_NONCE));
                // User is auth

                await updateNonce(userAddress);

                let jwtToken = generateJWT(userAddress);
                let date = new Date();
                date.setTime(date.getTime() + 6 * 60 * 60 * 1000) // 6 hours from now
                
                return reply.setCookie('jwt', jwtToken,{path: '/', expires: date, httpOnly:true}).code(200).send({
                    token: jwtToken,
                    address: userAddress,
                    validity: JWT_VALIDITY_TIME
                });
                /* eslint-disable */
            } catch (e: any) {
                logError(e);
                if (e.message.includes('Invalid signature')) return reply.code(400).send(error(400, ERROR_INVALID_SIGNATURE));
                else return reply.code(500).send(error(500, ERROR_INTERNAL));
            }
        }
    });

}
