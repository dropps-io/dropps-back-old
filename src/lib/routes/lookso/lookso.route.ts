import { FastifyInstance } from 'fastify';
import {verifyJWT} from '../../../bin/json-web-token';
import {error, ERROR_INTERNAL, ERROR_INVALID_PAGE, ERROR_NOT_FOUND, PUSH_REGISTRY_REQUIRED, RESOURCE_EXISTS} from '../../../bin/utils/error-messages';
import {logError} from '../../../bin/logger';
import {Follow} from "../../../models/types/follow";
import {
	insertFollow,
	removeFollow
} from "../../../bin/db/follow.table";
import {queryContract} from "../../../bin/db/contract.table";
import {Post} from "../../../models/types/post";
import {queryPost, queryPosts, queryPostsCount} from "../../../bin/db/post.table";
import {constructFeed} from "../../../bin/lookso/feed/construct-feed";
import {insertLike, queryPostLike, removeLike} from "../../../bin/db/like.table";
import {Like} from "../../../models/types/like";
import {looksoPostRoutes} from "./lookso-post.route";
import {looksoProfileRoutes} from "./lookso-profile.route";
import {insertNotification} from "../../../bin/db/notification.table";
import {search} from "../../../bin/lookso/search";
import {insertRegistryChange, queryRegistryChangesCountOfAddress} from "../../../bin/db/registry-change.table";
import {API_URL, MAX_OFFCHAIN_REGISTRY_CHANGES, POSTS_PER_LOAD, PROFILES_PER_SEARCH} from "../../../environment/config";
import {applyChangesToRegistry} from "../../../bin/lookso/registry/apply-changes-to-registry";
import {buildJsonUrl} from "../../../bin/utils/json-url";
import {upload} from "../../../bin/arweave/utils/upload";
import {objectToBuffer} from "../../../bin/utils/file-converters";
import {ADDRESS_SCHEMA_VALIDATION, HASH_SCHEMA_VALIDATION, PAGE_SCHEMA_VALIDATION, POST_TYPE_SCHEMA_VALIDATION} from "../../../models/json/utils.schema";
import {looksoTxRoutes} from "./lookso-tx.route";

export async function looksoRoute (fastify: FastifyInstance) {

	fastify.route({
		method: 'POST',
		url: '/follow',
		schema: {
			description: 'Follow a new profile.',
			tags: ['lookso'],
			summary: 'Follow a new profile',
			body: {
				type: 'object',
				required: ['follower', 'following'],
				additionalProperties: false,
				properties: {
					follower: {...ADDRESS_SCHEMA_VALIDATION, description: 'Address of the logged user'},
					following: {...ADDRESS_SCHEMA_VALIDATION, description: 'Address to follow'}
				}
			}
		},
		handler: async (request, reply) => {
			const body = request.body as Follow;
			const jwtError = await verifyJWT(request, reply, body.follower);
			if (jwtError) return jwtError;

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
			body: {
				type: 'object',
				required: ['follower', 'following'],
				additionalProperties: false,
				properties: {
					follower: {...ADDRESS_SCHEMA_VALIDATION, description: 'Address of the logged user'},
					following: {...ADDRESS_SCHEMA_VALIDATION, description: 'Address to unfollow'}
				}
			}
		},
		handler: async (request, reply) => {
			const body = request.body as Follow;
			const jwtError = await verifyJWT(request, reply, body.follower);
			if (jwtError) return jwtError;

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
			body: {
				type: 'object',
				required: ['sender', 'postHash'],
				additionalProperties: false,
				properties: {
					sender: {...ADDRESS_SCHEMA_VALIDATION, description: 'Address of the logged user'},
					postHash: {...HASH_SCHEMA_VALIDATION, description: 'Hash of the post to like'}
				}
			}
		},
		handler: async (request, reply) => {
			const body = request.body as Like;
			const jwtError = await verifyJWT(request, reply, body.sender);
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

	//TODO Add end to end test to verify if it throws when invalid params
	fastify.route({
		method: 'GET',
		url: '/feed',
		schema: {
			description: 'Get posts linked to a profile.',
			tags: ['lookso'],
			querystring: {
				page: PAGE_SCHEMA_VALIDATION,
				postType: POST_TYPE_SCHEMA_VALIDATION,
				viewOf: {...ADDRESS_SCHEMA_VALIDATION, description: 'Address of the user connected to the feed'},
			},
			summary: 'Get profile feed.',
		},
		handler: async (request, reply) => {
			const query = request.query as { page?: number, postType?: 'event' | 'post', viewOf?: string };

			try {
				const count = await queryPostsCount(query.postType);
				if (count == 0) return reply.code(200).send({count: 0, page: null, next: null, previous: null, results: []});
				const page = query.page !== undefined ? query.page : Math.ceil(count / POSTS_PER_LOAD) - 1;
				if (page >= count / POSTS_PER_LOAD) return reply.code(400).send(error(400, ERROR_INVALID_PAGE));
				const posts: Post[] = await queryPosts(POSTS_PER_LOAD, page * POSTS_PER_LOAD, query.postType);
				const feed = await constructFeed(posts, query.viewOf);

				const queryUrl = `${API_URL}/lookso/feed?${query.postType ? 'postType=' + query.postType + '&' : ''}${query.viewOf ? 'viewOf=' + query.viewOf + '&' : ''}page=`;

				return reply.code(200).send({
					count,
					page,
					next: page < Math.ceil(count / POSTS_PER_LOAD) - 1 ? queryUrl + (page + 1).toString() : null,
					previous: page > 0 ? queryUrl + (page - 1).toString() : null,
					results: feed
				});
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
				page: PAGE_SCHEMA_VALIDATION
			},
			summary: 'Search in our database with an input.',
		},
		handler: async (request, reply) => {
			const {input} = request.params as { input: string };
			const query = request.query as { page?: number };
			const page = query.page ? query.page : 0;

			try {
				const profiles = await search(input, page);

				const queryUrl = `${API_URL}/lookso/search/${input}?page=`;

				return reply.code(200).send({
					...profiles,
					next: page < Math.ceil(profiles.count / PROFILES_PER_SEARCH) - 1 ? queryUrl + (page + 1).toString() : null,
					previous: page > 0 ? queryUrl + (page - 1).toString() : null,
				});
				/* eslint-disable */
			} catch (e: any) {
				logError(e);
				if ((e as string) === ERROR_INVALID_PAGE) return reply.code(400).send(error(400, ERROR_INVALID_PAGE))
				return reply.code(500).send(error(500, ERROR_INTERNAL));
			}
		}
	});

	looksoProfileRoutes(fastify);

	looksoPostRoutes(fastify);

	looksoTxRoutes(fastify);
}
