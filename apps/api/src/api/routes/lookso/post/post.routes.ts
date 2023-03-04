import { FastifyInstance } from 'fastify';
import multer from 'fastify-multer';

import { LSPXXProfilePost } from '../../../../lib/lookso/registry/types/profile-post';
import { verifyJWT } from '../../../../lib/json-web-token';
import { queryPost } from '../../../../lib/db/queries/post.table';
import { FeedPost } from '../../../../models/types/feed-post';
import { constructFeed } from '../../../../lib/lookso/feed/construct-feed';
import {
  ADDRESS_SCHEMA_VALIDATION,
  HASH_SCHEMA_VALIDATION,
  PAGE_SCHEMA_VALIDATION,
} from '../../../../models/json/utils.schema';
import { API_URL } from '../../../../environment/config';
import { looksoPostService } from './post.service';
import { handleError } from '../../../utils/handle-error';

interface MulterRequest extends Request {
  file: any;
}

export function looksoPostRoutes(fastify: FastifyInstance) {
  fastify.route({
    method: 'GET',
    url: '/post/:hash',
    schema: {
      description: 'Get a post information.',
      tags: ['lookso'],
      summary: 'Get a post information.',
      querystring: {
        viewOf: ADDRESS_SCHEMA_VALIDATION,
      },
      params: {
        hash: HASH_SCHEMA_VALIDATION,
      },
    },
    handler: async (request, reply) => {
      const { hash } = request.params as { hash: string };
      const { viewOf } = request.query as { viewOf?: string };

      try {
        const post = await queryPost(hash);
        const feedPost: FeedPost = (await constructFeed([post], viewOf))[0];
        return reply.code(200).send(feedPost);
      } catch (e: any) {
        return handleError(e, reply);
      }
    },
  });

  fastify.route({
    method: 'GET',
    url: '/post/:hash/likes',
    schema: {
      description: 'Get profile likes list.',
      tags: ['lookso'],
      summary: 'Get profile likes list.',
      querystring: {
        page: PAGE_SCHEMA_VALIDATION,
        sender: ADDRESS_SCHEMA_VALIDATION,
        viewOf: ADDRESS_SCHEMA_VALIDATION,
      },
      params: {
        hash: HASH_SCHEMA_VALIDATION,
      },
    },
    handler: async (request, reply) => {
      const { hash } = request.params as { hash: string };
      const { viewOf, sender } = request.query as {
        viewOf?: string;
        sender?: string;
      };
      let { page } = request.query as { page?: number };
      page = page || 0;

      try {
        const response = await looksoPostService.getPostLikes(hash, page, sender, viewOf);
        reply.code(200).send(response);
      } catch (e: any) {
        return handleError(e, reply);
      }
    },
  });

  fastify.route({
    method: 'GET',
    url: '/post/:hash/comments',
    schema: {
      description: 'Get post comments.',
      tags: ['lookso'],
      querystring: {
        page: { type: 'number', minimum: 0 },
        viewOf: ADDRESS_SCHEMA_VALIDATION,
      },
      params: {
        hash: HASH_SCHEMA_VALIDATION,
      },
      summary: 'Get post comments.',
    },
    handler: async (request, reply) => {
      const { hash } = request.params as { hash: string };
      const { page, viewOf } = request.query as { page?: number; viewOf?: string };

      const queryUrl = `${API_URL}/lookso/post/${hash}/comments?${
        viewOf ? 'viewOf=' + viewOf + '&' : ''
      }page=`;

      try {
        const postCommentsResponse = await looksoPostService.getPostComments(
          hash,
          queryUrl,
          page,
          viewOf,
        );

        return reply.code(200).send(postCommentsResponse);
      } catch (e: any) {
        return handleError(e, reply);
      }
    },
  });

  fastify.route({
    method: 'POST',
    url: '/post/asset',
    preHandler: multer().single('asset'),
    schema: {
      description: 'Upload a media to arweave.',
      tags: ['lookso'],
      summary: 'Upload a media to arweave.',
    },
    handler: async (request, reply) => {
      const body = request.body as { lspXXProfilePost: string };
      const documentFile: any = (request as unknown as MulterRequest).file;
      const post: LSPXXProfilePost = JSON.parse(body.lspXXProfilePost) as LSPXXProfilePost;
      const jwtError = await verifyJWT(request, reply, post.author);
      if (jwtError) return jwtError;

      const buffer = documentFile.buffer;
      const fileType: string = documentFile.mimetype;

      try {
        post.asset = await looksoPostService.processFileUpload(buffer, fileType);

        return reply.code(200).send({ LSPXXProfilePost: post });
      } catch (e: any) {
        return handleError(e, reply);
      }
    },
  });

  fastify.route({
    method: 'POST',
    url: '/post/upload',
    schema: {
      description: 'Upload a post to arweave.',
      tags: ['lookso'],
      summary: 'Upload a post to arweave.',
    },
    handler: async (request, reply) => {
      const body = request.body as { lspXXProfilePost: LSPXXProfilePost };
      const jwtError = await verifyJWT(request, reply, body.lspXXProfilePost.author);
      if (jwtError) return jwtError;

      try {
        const response = await looksoPostService.uploadProfilePost(body.lspXXProfilePost);

        return reply.code(200).send(response);
      } catch (e: any) {
        return handleError(e, reply);
      }
    },
  });
}
