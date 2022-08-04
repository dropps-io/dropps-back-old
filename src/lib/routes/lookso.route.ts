// import {isAddress} from '../../bin/utils/validators';
// import {
// 	error, ERROR_ADR_INVALID,
// 	ERROR_INCORRECT_SIGNED_NONCE,
// 	ERROR_INTERNAL,
// 	ERROR_INVALID_SIGNATURE
// } from '../../bin/utils/error-messages';
// import {insertNonce, queryNonce, updateNonce} from '../../bin/db/nonces.table';
// import {generateAddressWithSignature} from '../../bin/web3/auth';
// import {generateJWT} from '../../bin/json-web-token';
// import {FastifyInstance} from 'fastify';
// import {JWT_VALIDITY_TIME} from '../../environment/config';
// import {logError} from '../../bin/logger';
// import Web3 from "web3";
//
// export async function authRoute (fastify: FastifyInstance) {
//
// 	fastify.route({
// 		method: 'GET',
// 		url: '/:userAddress',
// 		schema: {
// 			description: 'Get the feed of a user.',
// 			tags: ['lookso'],
// 			summary: 'Get a user feed',
// 		},
// 		handler: async (request, reply) => {
// 			try {
// 				const {userAddress} = request.params as { userAddress: string };
// 				if (!isAddress(userAddress)) return reply.code(400).send(error(400, ERROR_ADR_INVALID));
// 				const web3 = Web3()
// 				if (!nonce) nonce = await insertNonce(userAddress);
// 				return reply.code(200).send({nonce});
// 				/* eslint-disable */
//       } catch (e: any) {
//         logError(e);
//         return reply.code(500).send(error(500, ERROR_INTERNAL));
//       }
//     }
//   });
// }
