import { FastifyInstance } from 'fastify';
import {isAddress} from '../../bin/utils/validators';
import {verifyJWT} from '../../bin/json-web-token';
import {error, ERROR_ADR_INVALID, ERROR_INTERNAL, ERROR_NOT_FOUND, RESOURCE_EXISTS} from '../../bin/utils/error-messages';
import {logError} from '../../bin/logger';
import {Follow} from "../../models/types/follow";
import {
	insertFollow,
	queryFollowersCount,
	queryFollowersWithNames,
	queryFollowingCount, queryFollowingWithNames
} from "../../bin/db/follow.table";
import {queryContract} from "../../bin/db/contract.table";
import {queryImagesByType} from "../../bin/db/image.table";

export async function looksoRoute (fastify: FastifyInstance) {

	fastify.route({
		method: 'POST',
		url: '/follow',
		schema: {
			description: 'Follow a new profile.',
			tags: ['lookso'],
			summary: 'Follow a new profile',
		},
		handler: async (request, reply) => {
			const body = request.body as Follow;
			verifyJWT(request, reply, body.follower);
			if (!isAddress(body.following)) return reply.code(400).send(error(400, ERROR_ADR_INVALID));

			try {
				const contract = await queryContract(body.following);
				if (contract && contract.interfaceCode !== 'LSP0') return reply.code(400).send(error(400, 'The following address is not an LSP0'));
				await insertFollow(body.follower, body.following);
				return reply.code(200).send();
				/* eslint-disable */
			} catch (e: any) {
				logError(e);
				if(e.code === '23503' && e.detail.includes('present')) return reply.code(409).send(error(404, ERROR_NOT_FOUND));
				if(e.code === '23505' && e.detail.includes('exists')) return reply.code(409).send(error(409, RESOURCE_EXISTS));
				return reply.code(500).send(error(500, ERROR_INTERNAL));
			}
		}
	});

	fastify.route({
		method: 'GET',
		url: '/profile/:address/followers',
		schema: {
			description: 'Get profile followers list.',
			tags: ['lookso'],
			summary: 'Get profile followers list.',
			querystring: {
				limit: { type: 'number' },
				offset: { type: 'number' },
			}
		},
		handler: async (request, reply) => {
			const {address} = request.params as { address: string};
			const {limit, offset} = request.query as {limit: number, offset: number};

			try {
				const response = [];
				const followers = await queryFollowersWithNames(address, limit, offset);
				for (let follower of followers) {
					const images = await queryImagesByType(follower.address, 'profile');
					response.push({...follower, images});
				}
				return reply.code(200).send(response);
				/* eslint-disable */
			} catch (e: any) {
				logError(e);
				reply.code(500).send(error(500, ERROR_INTERNAL));
			}
		}
	});

	fastify.route({
		method: 'GET',
		url: '/profile/:address/followers/count',
		schema: {
			description: 'Get profile followers count.',
			tags: ['lookso'],
			summary: 'Get profile followers count.'
		},
		handler: async (request, reply) => {
			const {address} = request.params as { address: string };

			try {
				const followers: number = await queryFollowersCount(address);
				return reply.code(200).send({followers});
				/* eslint-disable */
			} catch (e: any) {
				logError(e);
				reply.code(500).send(error(500, ERROR_INTERNAL));
			}
		}
	});

	fastify.route({
		method: 'GET',
		url: '/profile/:address/following',
		schema: {
			description: 'Get profile follow list with address, name and profile pictures.',
			tags: ['lookso'],
			querystring: {
				limit: { type: 'number' },
				offset: { type: 'number' },
			},
			summary: 'Get all the profiles a user is following.',
		},
		handler: async (request, reply) => {
			const {address} = request.params as { address: string };
			const {limit, offset} = request.query as {limit: number, offset: number};

			try {
				const response = [];
				const following = await queryFollowingWithNames(address, limit, offset);
				for (let followingProfile of following) {
					const images = await queryImagesByType(followingProfile.address, 'profile');
					response.push({...followingProfile, images});
				}
				return reply.code(200).send(response);
				/* eslint-disable */
			} catch (e: any) {
				logError(e);
				reply.code(500).send(error(500, ERROR_INTERNAL));
			}
		}
	});

	fastify.route({
		method: 'GET',
		url: '/profile/:address/following/count',
		schema: {
			description: 'Get profile following count.',
			tags: ['lookso'],
			summary: 'Get profile following count.',
		},
		handler: async (request, reply) => {
			const {address} = request.params as { address: string };

			try {
				const following: number = await queryFollowingCount(address);
				return reply.code(200).send({following});
				/* eslint-disable */
			} catch (e: any) {
				logError(e);
				reply.code(500).send(error(500, ERROR_INTERNAL));
			}
		}
	});
}
