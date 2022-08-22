import { FastifyInstance } from 'fastify';
import {isAddress} from '../../../bin/utils/validators';
import {verifyJWT} from '../../../bin/json-web-token';
import {error, ERROR_ADR_INVALID, ERROR_INTERNAL, ERROR_NOT_FOUND, RESOURCE_EXISTS} from '../../../bin/utils/error-messages';
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
				await insertNotification(body.following, body.following, new Date(), 'follow');
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
		method: 'DELETE',
		url: '/unfollow',
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
				await removeFollow(body.follower, body.following);
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
		method: 'POST',
		url: '/like',
		schema: {
			description: 'Like or unlike a post.',
			tags: ['lookso'],
			summary: 'Like or unlike a post',
		},
		handler: async (request, reply) => {
			const body = request.body as Like;
			verifyJWT(request, reply, body.sender);

			try {
				const liked: boolean = await queryPostLike(body.sender, body.postHash);
				if (liked) {
					await removeLike(body.sender, body.postHash)
				} else {
					await insertLike(body.sender, body.postHash);
					const post = await queryPost(body.postHash);
					await insertNotification(post.author, body.sender, new Date(), 'like', post.hash);
				}

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
		url: '/feed',
		schema: {
			description: 'Get posts linked to a profile.',
			tags: ['lookso'],
			querystring: {
				limit: { type: 'number' },
				offset: { type: 'number' },
				postType: { type: 'string' },
			},
			summary: 'Get profile feed.',
		},
		handler: async (request, reply) => {
			const {limit, offset, postType} = request.query as { limit: number, offset: number, postType?: 'event' | 'post' };

			try {
				const posts: Post[] = await queryPosts(limit, offset, postType);
				const feed = await constructFeed(posts);

				return reply.code(200).send(feed);
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
