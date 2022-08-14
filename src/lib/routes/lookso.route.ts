import { FastifyInstance } from 'fastify';
import {isAddress} from '../../bin/utils/validators';
import {verifyJWT} from '../../bin/json-web-token';
import {error, ERROR_ADR_INVALID, ERROR_INTERNAL, ERROR_NOT_FOUND, RESOURCE_EXISTS} from '../../bin/utils/error-messages';
import {logError} from '../../bin/logger';
import {Follow} from "../../models/types/follow";
import {
	insertFollow,
	queryFollow,
	queryFollowersCount,
	queryFollowersWithNames,
	queryFollowing,
	queryFollowingCount,
	queryFollowingWithNames, removeFollow
} from "../../bin/db/follow.table";
import {queryContract} from "../../bin/db/contract.table";
import {queryImages, queryImagesByType} from "../../bin/db/image.table";
import {Post} from "../../models/types/post";
import {queryPosts, queryPostsOfUser, queryPostsOfUsers} from "../../bin/db/post.table";
import {constructFeed} from "../../bin/lookso/feed/construct-feed";
import {queryContractMetadata} from "../../bin/db/contract-metadata.table";
import {queryTags} from "../../bin/db/tag.table";
import {queryLinks} from "../../bin/db/link.table";
import {selectImage} from "../../bin/utils/select-image";
import {insertLike, queryPostLike, queryPostLikesWithNames, removeLike} from "../../bin/db/like.table";
import {Like} from "../../models/types/like";

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
		url: '/profile/:address/followers',
		schema: {
			description: 'Get profile followers list.',
			tags: ['lookso'],
			summary: 'Get profile followers list.',
			querystring: {
				limit: { type: 'number' },
				offset: { type: 'number' },
				followerAddress: { type: 'string' },
			}
		},
		handler: async (request, reply) => {
			const {address} = request.params as { address: string};
			const {followerAddress, limit, offset} = request.query as {followerAddress:string, limit: number, offset: number};

			try {
				if (followerAddress) {
					if (!isAddress(followerAddress)) return reply.code(400).send(error(400, ERROR_ADR_INVALID));
					const isFollower = await queryFollow(followerAddress, address);
					return reply.code(200).send({followers: isFollower ? [followerAddress] : []});
				}
				else {
					const response = [];
					const followers = await queryFollowersWithNames(address, limit, offset);
					for (let follower of followers) {
						const images = await queryImagesByType(follower.address, 'profile');
						response.push({...follower, image: selectImage(images, {minWidthExpected: 50})});
					}
					return reply.code(200).send(response);
				}
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

	fastify.route({
		method: 'GET',
		url: '/profile/:address/activity',
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
			const {address} = request.params as { address: string };
			const {limit, offset, postType} = request.query as { limit: number, offset: number, postType?: 'event' | 'post' };

			try {
				const posts: Post[] = await queryPostsOfUser(address, limit, offset, postType);
				const feed = await constructFeed(posts, address);

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
		url: '/profile/:address/feed',
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
			const {address} = request.params as { address: string };
			const {limit, offset, postType} = request.query as { limit: number, offset: number, postType?: 'event' | 'post' };

			try {
				const followingList = await queryFollowing(address);
				const posts: Post[] = await queryPostsOfUsers(followingList, limit, offset, postType);
				const feed = await constructFeed(posts, address);

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
		url: '/profile/:address/info',
		schema: {
			description: 'Get profile name, description, picture, tags, links and background.',
			tags: ['lookso'],
			summary: 'Get profile info.',
		},
		handler: async (request, reply) => {
			const {address} = request.params as { address: string };

			try {
				const metadata = await queryContractMetadata(address);

				if (!metadata) return reply.code(404).send(error(404, ERROR_NOT_FOUND));

				const tags = await queryTags(address);
				const links = await queryLinks(address);
				const images = await queryImages(address);
				const backgroundImage = selectImage(images.filter(i => i.type === 'background'), {minWidthExpected: 1900})
				const profileImage = selectImage(images.filter(i => i.type === 'profile'), {minWidthExpected: 210})

				return reply.code(200).send({address: metadata.address, name: metadata.name, links: links.map(l => { return {title: l.title, url: l.url}}), tags, description: metadata.description, profileImage: profileImage ? profileImage.url : '', backgroundImage: backgroundImage ? backgroundImage.url : ''});
				/* eslint-disable */
			} catch (e: any) {
				logError(e);
				reply.code(500).send(error(500, ERROR_INTERNAL));
			}
		}
	});

	fastify.route({
		method: 'GET',
		url: '/post/:hash/likes',
		schema: {
			description: 'Get profile likes list.',
			tags: ['lookso'],
			summary: 'Get profile likes list.',
			querystring: {
				limit: { type: 'number' },
				offset: { type: 'number' }
			}
		},
		handler: async (request, reply) => {
			const {hash} = request.params as { hash: string};
			const {limit, offset} = request.query as {sender:string, limit: number, offset: number};

			try {
				const response = [];
				const likes = await queryPostLikesWithNames(hash, limit, offset);
				for (let like of likes) {
					const images = await queryImagesByType(like.address, 'profile');
					response.push({...like, image: selectImage(images, {minWidthExpected: 50})});
				}
				return reply.code(200).send(response);
				/* eslint-disable */
			} catch (e: any) {
				logError(e);
				reply.code(500).send(error(500, ERROR_INTERNAL));
			}
		}
	});

}
