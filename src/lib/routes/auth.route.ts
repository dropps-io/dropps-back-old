import {isAddress} from '../../bin/utils/validators';
import {ADR_INVALID, error, INCORRECT_SIGNED_NONCE, INTERNAL, INVALID_SIGNATURE} from '../../bin/utils/error-messages';
import {insertNonce, queryNonce, updateNonce} from '../../bin/db/nonces.table';
import {generateAddressWithSignature} from '../../bin/web3/auth';
import {generateJWT} from '../../bin/json-web-token';
import {FastifyInstance} from 'fastify';

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
				if (!isAddress(userAddress)) return reply.code(400).send(error(400, ADR_INVALID));
				let nonce: string = await queryNonce(userAddress);
				if (!nonce) nonce = await insertNonce(userAddress);
				return reply.code(200).send({nonce});
				/* eslint-disable */
      } catch (e: any) {
        console.error(e);
        return reply.code(500).send(error(500, INTERNAL));
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

      try {
        if (!isAddress(userAddress)) return reply.code(400).send(error(400, ADR_INVALID));
        let nonce: string = await queryNonce(userAddress);

        if (generateAddressWithSignature(nonce, signedNonce).toUpperCase() === userAddress.toUpperCase()) {
          // User is auth
          await updateNonce(userAddress);

          return reply.code(200).send({
            token: generateJWT(userAddress),
            userAddress: userAddress,
            message: 'Token valid for 6h'
          });
        } else {
          // User is not auth
          reply.code(403).send(error(403, INCORRECT_SIGNED_NONCE));
        }
        /* eslint-disable */
      } catch (e: any) {
        console.error(e);
        if (e.message.includes('Invalid signature')) return reply.code(400).send(error(400, INVALID_SIGNATURE));
        else return reply.code(500).send(error(500, INTERNAL));
      }
    }
  });
}
