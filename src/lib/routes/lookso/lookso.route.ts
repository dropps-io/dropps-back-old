import { FastifyInstance } from 'fastify';
import {isAddress} from '../../../bin/utils/validators';
import {verifyJWT} from '../../../bin/json-web-token';
import {error, ERROR_ADR_INVALID, ERROR_INTERNAL, ERROR_NOT_FOUND, PUSH_REGISTRY_REQUIRED, RESOURCE_EXISTS} from '../../../bin/utils/error-messages';
import {logError} from '../../../bin/logger';
import {Follow} from "../../../models/types/follow";
import {
	insertFollow,
	removeFollow
} from "../../../bin/db/follow.table";
import {queryContract} from "../../../bin/db/contract.table";
import {Post} from "../../../models/types/post";
import {queryPost, queryPosts} from "../../../bin/db/post.table";
import {constructFeed} from "../../../bin/lookso/feed/construct-feed";
import {insertLike, queryPostLike, removeLike} from "../../../bin/db/like.table";
import {Like} from "../../../models/types/like";
import {looksoPostRoutes} from "./lookso-post.route";
import {looksoProfileRoutes} from "./lookso-profile.route";
import {insertNotification} from "../../../bin/db/notification.table";
import {search} from "../../../bin/lookso/search";
import {insertRegistryChange, queryRegistryChangesCountOfAddress} from "../../../bin/db/registry-change.table";
import {MAX_OFFCHAIN_REGISTRY_CHANGES} from "../../../environment/config";
import {applyChangesToRegistry} from "../../../bin/lookso/registry/apply-changes-to-registry";
import {buildJsonUrl} from "../../../bin/utils/json-url";
import {upload} from "../../../bin/arweave/utils/upload";
import {objectToBuffer} from "../../../bin/utils/file-converters";

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
			const jwtError = verifyJWT(request, reply, body.follower);
			if (jwtError) return jwtError;
			if (!isAddress(body.following)) return reply.code(400).send(error(400, ERROR_ADR_INVALID));

			const registryChangesCount = await queryRegistryChangesCountOfAddress(body.follower);
			if (registryChangesCount >= MAX_OFFCHAIN_REGISTRY_CHANGES) return reply.code(409).send(error(409, PUSH_REGISTRY_REQUIRED));

			try {
				const contract = await queryContract(body.following);
				if (contract && contract.interfaceCode !== 'LSP0') return reply.code(400).send(error(400, 'The following address is not an LSP0'));
				await insertFollow(body.follower, body.following);
				await insertRegistryChange(body.follower, 'follow', 'add', body.following, new Date());
				await insertNotification(body.following, body.follower, new Date(), 'follow');

				if (registryChangesCount  + 1 >= MAX_OFFCHAIN_REGISTRY_CHANGES) {
					const newRegistry = await applyChangesToRegistry(body.follower);
					const url = await upload(objectToBuffer(newRegistry), 'application/json');
					const jsonUrl = buildJsonUrl(newRegistry, url);
					return reply.code(200).send({jsonUrl});
				} else {
					return reply.code(200).send({});
				}
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
		method: 'DELETE',
		url: '/unfollow',
		schema: {
			description: 'Follow a new profile.',
			tags: ['lookso'],
			summary: 'Follow a new profile',
		},
		handler: async (request, reply) => {
			const body = request.body as Follow;
			const jwtError = verifyJWT(request, reply, body.follower);
			if (jwtError) return jwtError;
			if (!isAddress(body.following)) return reply.code(400).send(error(400, ERROR_ADR_INVALID));

			const registryChangesCount = await queryRegistryChangesCountOfAddress(body.follower);
			if (registryChangesCount >= MAX_OFFCHAIN_REGISTRY_CHANGES) return reply.code(409).send(error(409, PUSH_REGISTRY_REQUIRED));

			try {
				const contract = await queryContract(body.following);
				if (contract && contract.interfaceCode !== 'LSP0') return reply.code(400).send(error(400, 'The following address is not an LSP0'));
				await removeFollow(body.follower, body.following);
				await insertRegistryChange(body.follower, 'follow', 'remove', body.following, new Date());

				if (registryChangesCount  + 1 >= MAX_OFFCHAIN_REGISTRY_CHANGES) {
					const newRegistry = await applyChangesToRegistry(body.follower);
					const url = await upload(objectToBuffer(newRegistry), 'application/json');
					const jsonUrl = buildJsonUrl(newRegistry, url);
					return reply.code(200).send({jsonUrl});
				} else {
					return reply.code(200).send({});
				}
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
		method: 'POST',
		url: '/like',
		schema: {
			description: 'Like or unlike a post.',
			tags: ['lookso'],
			summary: 'Like or unlike a post',
		},
		handler: async (request, reply) => {
			const body = request.body as Like;
			const jwtError = verifyJWT(request, reply, body.sender);
			if (jwtError) return jwtError;

			const registryChangesCount = await queryRegistryChangesCountOfAddress(body.sender);
			if (registryChangesCount >= MAX_OFFCHAIN_REGISTRY_CHANGES) return reply.code(409).send(error(409, PUSH_REGISTRY_REQUIRED));

			try {
				const liked: boolean = await queryPostLike(body.sender, body.postHash);
				if (liked) {
					await removeLike(body.sender, body.postHash);
					await insertRegistryChange(body.sender, 'like', 'remove', body.postHash, new Date());
				} else {
					await insertLike(body.sender, body.postHash);
					await insertRegistryChange(body.sender, 'like', 'add', body.postHash, new Date());
					const post = await queryPost(body.postHash);
					await insertNotification(post.author, body.sender, new Date(), 'like', post.hash);
				}

				if (registryChangesCount  + 1 >= MAX_OFFCHAIN_REGISTRY_CHANGES) {
					const newRegistry = await applyChangesToRegistry(body.sender);
					const url = await upload(objectToBuffer(newRegistry), 'application/json');
					const jsonUrl = buildJsonUrl(newRegistry, url);
					return reply.code(200).send({jsonUrl});
				}
				else {
					return reply.code(200).send({});
				}
				/* eslint-disable */
			} catch (e: any) {
				logError(e);
				if(e.code === '23503' && e.detail.includes('present')) return reply.code(404).send(error(404, ERROR_NOT_FOUND));
				if(e.code === '23505' && e.detail.includes('exists')) return reply.code(409).send(error(409, RESOURCE_EXISTS));
				return reply.code(500).send(error(500, ERROR_INTERNAL));
			}
		}
	});

	fastify.route({
		method: 'GET',
		url: '/feed',
		schema: {
			description: 'Get posts linked to a profile.',
			tags: ['lookso'],
			querystring: {
				limit: { type: 'number' },
				offset: { type: 'number' },
				postType: { type: 'string' },
				viewOf: { type: 'string' },
			},
			summary: 'Get profile feed.',
		},
		handler: async (request, reply) => {
			const {limit, offset, postType, viewOf} = request.query as { limit: number, offset: number, postType?: 'event' | 'post', viewOf?: string };

			try {
				const posts: Post[] = await queryPosts(limit, offset, postType);
				const feed = await constructFeed(posts, viewOf);

				return reply.code(200).send(feed);
				/* eslint-disable */
			} catch (e: any) {
				logError(e);
				reply.code(500).send(error(500, ERROR_INTERNAL));
			}
		}
	});

	fastify.route({
		method: 'GET',
		url: '/search/:input',
		schema: {
			description: 'Search in our database with an input.',
			tags: ['lookso'],
			querystring: {
				limit: { type: 'number' },
				offset: { type: 'number' },
			},
			summary: 'Search in our database with an input.',
		},
		handler: async (request, reply) => {
			const {input} = request.params as { input: string };
			const {limit, offset} = request.query as { limit: number, offset: number};

			try {
				const profiles = await search(input, limit, offset);

				return reply.code(200).send(profiles);
				/* eslint-disable */
			} catch (e: any) {
				logError(e);
				reply.code(500).send(error(500, ERROR_INTERNAL));
			}
		}
	});

	looksoProfileRoutes(fastify);

	looksoPostRoutes(fastify);
}
