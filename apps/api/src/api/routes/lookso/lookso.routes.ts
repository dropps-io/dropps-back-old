import { FastifyInstance } from 'fastify';

import { verifyJWT } from '../../../lib/json-web-token';
import { FollowTable } from '../../../models/types/tables/follow-table';
import { LikeTable } from '../../../models/types/tables/like-table';
import { looksoPostRoutes } from './post/post.routes';
import { looksoProfileRoutes } from './profile/profile.routes';
import { API_URL } from '../../../environment/config';
import {
  ADDRESS_SCHEMA_VALIDATION,
  HASH_SCHEMA_VALIDATION,
  PAGE_SCHEMA_VALIDATION,
  POST_TYPE_SCHEMA_VALIDATION,
} from '../../../models/json/utils.schema';
import { looksoTxRoutes } from './transaction/tx.routes';
import { looksoService } from './lookso.service';
import { handleError } from '../../utils/handle-error';
import { looksoSearchRoutes } from './search/search.routes';

export async function looksoRoutes(fastify: FastifyInstance) {
  fastify.route({
    method: 'POST',
    url: '/follow',
    schema: {
      description: 'FollowTable a new profile.',
      tags: ['lookso'],
      summary: 'FollowTable a new profile',
      body: {
        type: 'object',
        required: ['follower', 'following'],
        additionalProperties: false,
        properties: {
          follower: { ...ADDRESS_SCHEMA_VALIDATION, description: 'Address of the logged user' },
          following: { ...ADDRESS_SCHEMA_VALIDATION, description: 'Address to follow' },
        },
      },
    },
    handler: async (request, reply) => {
      const { follower, following } = request.body as FollowTable;
      const jwtError = await verifyJWT(request, reply, follower);
      if (jwtError) return jwtError;

      try {
        const followResponse = await looksoService.follow(follower, following);
        return reply.code(200).send(followResponse);
      } catch (e: any) {
        return handleError(e, reply);
      }
    },
  });

  fastify.route({
    method: 'DELETE',
    url: '/unfollow',
    schema: {
      description: 'FollowTable a new profile.',
      tags: ['lookso'],
      summary: 'FollowTable a new profile',
      body: {
        type: 'object',
        required: ['follower', 'following'],
        additionalProperties: false,
        properties: {
          follower: { ...ADDRESS_SCHEMA_VALIDATION, description: 'Address of the logged user' },
          following: { ...ADDRESS_SCHEMA_VALIDATION, description: 'Address to unfollow' },
        },
      },
    },
    handler: async (request, reply) => {
      const { follower, following } = request.body as FollowTable;
      const jwtError = await verifyJWT(request, reply, follower);
      if (jwtError) return jwtError;

      try {
        const unfollowResponse = await looksoService.unfollow(follower, following);
        return reply.code(200).send(unfollowResponse);
      } catch (e: any) {
        return handleError(e, reply);
      }
    },
  });

  fastify.route({
    method: 'POST',
    url: '/like',
    schema: {
      description: 'LikeTable or unlike a post.',
      tags: ['lookso'],
      summary: 'LikeTable or unlike a post',
      body: {
        type: 'object',
        required: ['sender', 'postHash'],
        additionalProperties: false,
        properties: {
          sender: { ...ADDRESS_SCHEMA_VALIDATION, description: 'Address of the logged user' },
          postHash: { ...HASH_SCHEMA_VALIDATION, description: 'Hash of the post to like' },
        },
      },
    },
    handler: async (request, reply) => {
      const { sender, postHash } = request.body as LikeTable;
      const jwtError = await verifyJWT(request, reply, sender);
      if (jwtError) return jwtError;

      try {
        const likeResponse = await looksoService.like(sender, postHash);
        return reply.code(200).send(likeResponse);
      } catch (e: any) {
        return handleError(e, reply);
      }
    },
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
        viewOf: {
          ...ADDRESS_SCHEMA_VALIDATION,
          description: 'Address of the user connected to the feed',
        },
      },
      summary: 'Get profile feed.',
    },
    handler: async (request, reply) => {
      const { page, postType, viewOf } = request.query as {
        page?: number;
        postType?: 'event' | 'post';
        viewOf?: string;
      };

      const queryUrl = `${API_URL}/lookso/feed?${postType ? 'postType=' + postType + '&' : ''}${
        viewOf ? 'viewOf=' + viewOf + '&' : ''
      }page=`;

      try {
        const feedResponse = await looksoService.getFeed(queryUrl, postType, page, viewOf);
        return reply.code(200).send(feedResponse);
      } catch (e: any) {
        return handleError(e, reply);
      }
    },
  });

  looksoProfileRoutes(fastify);

  looksoPostRoutes(fastify);

  looksoTxRoutes(fastify);

  looksoSearchRoutes(fastify);
}
