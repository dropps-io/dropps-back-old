import { FastifyInstance } from 'fastify';
import {isAddress} from '../../bin/utils/validators';
import {insertUser, queryUser, updateUser} from '../../bin/db/users.table';
import {User} from '../models/types/user';
import {getPermissions} from '../../bin/u-profiles';
import {UserProfileRelation} from "../models/types/user-profile-relation";
import {throwError} from "../../bin/utils/throw-error";
import {UserProfile} from "../models/types/user-profile";
import {insertNonce, queryNonce, updateNonce} from "../../bin/db/nonces.table";
import {generateAddressWithSignature} from "../../bin/web3/auth";
import {generateJWT, verifyJWT} from "../../bin/json-web-token";
import * as userSchema from '../models/json/user.json';
import * as userProfileRelationSchema from '../models/json/user-profile-relation.json';
import {
	ADR_INVALID,
	ADR_NOT_EQUAL_PARAM_BODY, error, INCORRECT_SIGNED_NONCE,
	INTERNAL, INVALID_SIGNATURE,
	UP_NO_PERMISSIONS, USER_EXISTS,
	USER_NOT_FOUND, USER_PROFILE_RELATION_EXISTS, USER_PROFILE_RELATION_NOT_FOUND
} from '../../bin/utils/error-messages';
import {
	deleteUserProfileRelation,
	insertUserProfileRelation,
	queryProfilesOfUser, queryUserProfileRelation, updateUserProfileRelation
} from "../../bin/db/user-profile-relations.table";

export async function usersRoute (fastify: FastifyInstance) {

	fastify.route({
		method: 'POST',
		url: '/',
		schema: {
			description: 'Create a new user using his address and his selected profile address.',
			tags: ['users'],
			summary: 'Create a new user',
			body: userSchema,
			response: {200: userSchema}
		},
		handler: async (request, reply) => {
			const user = request.body as User;
			verifyJWT(request, reply, user.address);

			try {
				if (!await getPermissions(user.selectedProfile, user.address)) return reply.code(403).send(error(403, UP_NO_PERMISSIONS));
				await insertUser(user.address, user.selectedProfile);
				return reply.code(200).send(user);
				/* eslint-disable */
			} catch (e: any) {
				console.error(e);
				if (e.sqlState === '23000') return reply.code(422).send(error(422, USER_EXISTS));
				return reply.code(500).send(error(500, INTERNAL));
			}
		}
	});

	fastify.route({
		method: 'GET',
		url: '/:userAddress',
		schema: {
			description: 'Get information about a specific user.',
			tags: ['users'],
			summary: 'Get a user',
		},
		handler: async (request, reply) => {
			try {
				const {userAddress} = request.params as { userAddress: string };
				if (!isAddress(userAddress)) return reply.code(400).send(error(400, ADR_INVALID));
				const user = await queryUser(userAddress);
				if (!user) return reply.code(404).send(error(404, USER_NOT_FOUND));
				return  reply.code(200).send(user);
				/* eslint-disable */
			} catch (e: any) {
				console.error(e);
				return reply.code(500).send(error(500, INTERNAL));
			}
		}
	});

	fastify.route({
		method: 'PUT',
		url: '/:userAddress',
		schema: {
			description: 'Update the selected profile about a specific user.',
			tags: ['users'],
			summary: 'Update a user',
			body: userSchema,
			response: {200: userSchema}
		},
		handler: async (request, reply) => {
			const {userAddress} = request.params as { userAddress: string };
			const user = request.body as User;
			verifyJWT(request, reply, userAddress);

			try {
				if (!isAddress(userAddress)) return reply.code(400).send(error(400, ADR_INVALID));
				if (userAddress.toUpperCase() !== user.address.toUpperCase()) return reply.code(400).send(error(400, ADR_NOT_EQUAL_PARAM_BODY));
				if (!await getPermissions(user.selectedProfile, user.address)) return reply.code(403).send(error(403, UP_NO_PERMISSIONS));

				await updateUser(user.address, user.selectedProfile);
				return  reply.code(200).send(user);
				/* eslint-disable */
			} catch (e: any) {
				console.error(e);
				if (e === USER_NOT_FOUND) return reply.code(404).send(error(404, USER_NOT_FOUND));
				return reply.code(500).send(error(500, INTERNAL));
			}
		}
	});

	fastify.route({
		method: 'GET',
		url: '/:userAddress/nonce',
		schema: {
			description: 'Get the current nonce of a specific user.',
			tags: ['users'],
			summary: 'Get a user nonce',
		},
		handler: async (request, reply) => {
			try {
				const {userAddress} = request.params as { userAddress: string };
				if (!isAddress(userAddress)) return reply.code(400).send(error(400, ADR_INVALID));
				let nonce: string  = await queryNonce(userAddress);
				if (!nonce) nonce = await insertNonce(userAddress);
				return  reply.code(200).send({nonce});
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
			tags: ['users'],
			summary: 'Request for JWT',
			body: {
				type: 'object',
				required: ['signedNonce'],
				properties: {
					signedNonce: { type: 'string', description: 'Nonce signed by the user' }
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

					return  reply.code(200).send({
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

	fastify.route({
		method: 'GET',
		url: '/:userAddress/profiles',
		schema: {
			description: 'Get all saved profile addresses of a specific user.',
			tags: ['users'],
			summary: 'Get profiles of a user',
		},
		handler: async (request, reply) => {
			try {
				const {userAddress} = request.params as { userAddress: string };
				if (!isAddress(userAddress)) return reply.code(400).send(error(400, ADR_INVALID));
				const profiles: UserProfile[] = await queryProfilesOfUser(userAddress);
				return  reply.code(200).send(profiles);
				/* eslint-disable */
			} catch (e: any) {
				console.error(e);
				return reply.code(500).send(error(500, INTERNAL));
			}
		}
	});

	fastify.route({
		method: 'POST',
		url: '/:userAddress/profiles',
		schema: {
			description: 'Create a new user-profile relation row in the DB, adding the address of the user and the address of the profile.',
			tags: ['users'],
			summary: 'Add a profile to a user',
			body: userProfileRelationSchema,
			response: {200: userProfileRelationSchema}
		},
		handler: async (request, reply) => {
			const {userAddress} = request.params as { userAddress: string };
			const userProfileRelation = request.body as UserProfileRelation;
			verifyJWT(request, reply, userAddress);

			try {
				if (!isAddress(userAddress)) return reply.code(400).send(error(400, ADR_INVALID));
				if (userAddress.toUpperCase() !== userProfileRelation.userAddress.toUpperCase()) return reply.code(400).send(error(400, ADR_NOT_EQUAL_PARAM_BODY));
				if (!await throwError(queryUserProfileRelation(userProfileRelation.profileAddress, userAddress))) return reply.code(422).send(error(422, USER_PROFILE_RELATION_EXISTS));
				if (!await getPermissions(userProfileRelation.profileAddress, userProfileRelation.userAddress)) return reply.code(403).send(error(403, UP_NO_PERMISSIONS));

				await insertUserProfileRelation(userProfileRelation.profileAddress, userProfileRelation.userAddress, userProfileRelation.archived);
				return  reply.code(200).send(userProfileRelation);
				/* eslint-disable */
			} catch (e: any) {
				console.error(e);
				return reply.code(500).send(error(500, INTERNAL));
			}
		}
	});

	fastify.route({
		method: 'PUT',
		url: '/:userAddress/profiles/:profileAddress',
		schema: {
			description: 'Set the archived status of a user-profile relation row to true or false.',
			tags: ['users'],
			summary: 'Update a user profile',
			body: {
				type: 'object',
				required: ['archived'],
				properties: {
					projectId: { type: 'boolean', description: 'Is the profile archived by the user?' }
				}
			},
			response: {200: userProfileRelationSchema}
		},
		handler: async (request, reply) => {
			const {userAddress, profileAddress} = request.params as { userAddress: string, profileAddress: string };
			const {archived} = request.body as { archived: boolean };
			verifyJWT(request, reply, userAddress);

			try {
				if (!isAddress(userAddress) || !isAddress(profileAddress)) return reply.code(400).send(error(400, ADR_INVALID));
				await updateUserProfileRelation(profileAddress, userAddress, archived);
				return  reply.code(200).send({userAddress, profileAddress, archived});
				/* eslint-disable */
			} catch (e: any) {
				console.error(e);
				if (e === USER_PROFILE_RELATION_NOT_FOUND) reply.code(404).send(error(404, USER_PROFILE_RELATION_NOT_FOUND));
				return reply.code(500).send(error(500, INTERNAL));
			}
		}
	});

	fastify.route({
		method: 'DELETE',
		url: '/:userAddress/profiles/:profileAddress',
		schema: {
			description: 'Delete a user-profile relation row.',
			tags: ['users'],
			summary: 'Delete a user profile'
		},
		handler: async (request, reply) => {
			const {userAddress, profileAddress} = request.params as { userAddress: string, profileAddress: string };
			verifyJWT(request, reply, userAddress);

			try {
				if (!isAddress(userAddress) || !isAddress(profileAddress)) return reply.code(400).send(error(400, ADR_INVALID));
				await deleteUserProfileRelation(profileAddress, userAddress);
				return  reply.code(200).send({message: 'User-profile successfully deleted'});
				/* eslint-disable */
			} catch (e: any) {
				console.error(e);
				if (e === USER_PROFILE_RELATION_NOT_FOUND) reply.code(404).send(error(400, USER_PROFILE_RELATION_NOT_FOUND));
				return reply.code(500).send(error(500, INTERNAL));
			}
		}
	});
}
