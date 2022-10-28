import {queryPostLike, queryPostLikesCount, queryPostLikesWithNames} from "../../../bin/db/like.table";
import {queryImagesByType} from "../../../bin/db/image.table";
import {selectImage} from "../../../bin/utils/select-image";
import {logError} from "../../../bin/logger";
import {error, ERROR_INTERNAL, ERROR_INVALID_PAGE, FILE_TYPE_NOT_SUPPORTED} from "../../../bin/utils/error-messages";
import {LSPXXProfilePost, ProfilePost} from "../../../bin/lookso/registry/types/profile-post";
import {verifyJWT} from "../../../bin/json-web-token";
import sharp from "sharp";
import {arrayBufferKeccak256Hash, objectToBuffer, objectToKeccak256Hash} from "../../../bin/utils/file-converters";
import {buildJsonUrl} from "../../../bin/utils/json-url";
import {FastifyInstance} from "fastify";
import {queryPost, queryPostComments, queryPostCommentsCount} from "../../../bin/db/post.table";
import {FeedPost} from "../../../models/types/feed-post";
import {constructFeed} from "../../../bin/lookso/feed/construct-feed";
import {Post} from "../../../models/types/post";
import {applyChangesToRegistry} from "../../../bin/lookso/registry/apply-changes-to-registry";
import {upload} from "../../../bin/arweave/utils/upload";
import multer from "fastify-multer";
import {queryFollow} from "../../../bin/db/follow.table";
import {ADDRESS_SCHEMA_VALIDATION, HASH_SCHEMA_VALIDATION, PAGE_SCHEMA_VALIDATION} from "../../../models/json/utils.schema";
import {API_URL, COMMENTS_PER_LOAD, PROFILES_PER_LOAD} from "../../../environment/config";

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
        hash: HASH_SCHEMA_VALIDATION
      },
    },
    handler: async (request, reply) => {
      const {hash} = request.params as { hash: string};
      const {viewOf} = request.query as { viewOf?: string };

      try {
        const post = await queryPost(hash);
        const feedPost: FeedPost = (await constructFeed([post], viewOf))[0];
        return reply.code(200).send(feedPost);
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
        page: PAGE_SCHEMA_VALIDATION,
        sender: ADDRESS_SCHEMA_VALIDATION,
        viewOf: ADDRESS_SCHEMA_VALIDATION
      },
      params: {
        hash: HASH_SCHEMA_VALIDATION
      },
    },
    handler: async (request, reply) => {
      const {hash} = request.params as { hash: string};
      const query = request.query as {viewOf?: string, sender?:string, page?: number};
      const page = query.page ? query.page : 0;

      try {
        if (query.sender) {
          const isLiking = await queryPostLike(query.sender, hash);
          reply.code(200).send({
            count: isLiking ? 1 : 0,
            next: null,
            previous: null,
            results: isLiking ? [query.sender] : []
          });
        } else {
          const response = [];

          const likesCount = await queryPostLikesCount(hash);
          if (page && page >= likesCount / PROFILES_PER_LOAD) return reply.code(400).send(error(400, ERROR_INVALID_PAGE));
          const likes = await queryPostLikesWithNames(hash, PROFILES_PER_LOAD, page ? page * PROFILES_PER_LOAD : 0);
          for (let like of likes) {
            const images = await queryImagesByType(like.address, 'profile');
            const following = query.viewOf ? await queryFollow(query.viewOf, like.address) : undefined;
            const image = selectImage(images, {minWidthExpected: 50});
            response.push({...like, image: image ? image.url : '', following});
          }

          const queryUrl = `${API_URL}/lookso/post/${hash}/likes?${query.sender ? 'sender=' + query.sender + '&' : ''}${query.viewOf ? 'viewOf=' + query.viewOf + '&' : ''}page=`;

          return reply.code(200).send(
            {
              count: likesCount,
              next: page < Math.ceil(likesCount / PROFILES_PER_LOAD) - 1 ? queryUrl + (page + 1).toString() : null,
              previous: page > 0 ? queryUrl + (page - 1).toString() : null,
              results: response
            }
          );
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
    url: '/post/:hash/comments',
    schema: {
      description: 'Get post comments.',
      tags: ['lookso'],
      querystring: {
        page: { type: 'number', minimum: 0 },
        viewOf: ADDRESS_SCHEMA_VALIDATION,
      },
      params: {
        hash: HASH_SCHEMA_VALIDATION
      },
      summary: 'Get post comments.',
    },
    handler: async (request, reply) => {
      const {hash} = request.params as { hash: string };
      const query = request.query as { page?: number, viewOf?: string };

      try {
        const count = await queryPostCommentsCount(hash);
        if (count === 0) return reply.code(200).send({count: 0, page: null, next: null, previous: null, results: []});
        const page = query.page !== undefined ? query.page : Math.ceil(count / COMMENTS_PER_LOAD) - 1;
        if (page >= count / COMMENTS_PER_LOAD) return reply.code(400).send(error(400, ERROR_INVALID_PAGE));
        const posts: Post[] = await queryPostComments(hash, COMMENTS_PER_LOAD, page * COMMENTS_PER_LOAD);
        const feed = await constructFeed(posts, query.viewOf, true);

        const queryUrl = `${API_URL}/lookso/post/${hash}/comments?${query.viewOf ? 'viewOf=' + query.viewOf + '&' : ''}page=`;

        return reply.code(200).send({
          count,
          page,
          next: page < Math.ceil(count / COMMENTS_PER_LOAD) - 1 ? queryUrl + (page + 1).toString() : null,
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
    method: 'POST',
    url: '/post/asset',
    preHandler: multer().single('asset'),
    schema: {
      description: 'Upload a media to arweave.',
      tags: ['lookso'],
      summary: 'Upload a media to arweave.',
    },
    handler: async (request, reply) => {
      const body = request.body as { lspXXProfilePost: string};
      const documentFile: any = (request as unknown as MulterRequest).file;
      const post: LSPXXProfilePost = JSON.parse(body.lspXXProfilePost) as LSPXXProfilePost;
      const jwtError = await verifyJWT(request, reply, post.author);
      if (jwtError) return jwtError;

      let buffer = documentFile.buffer;
      let fileType = documentFile.mimetype;

      if (fileType.includes('image')) {
        buffer = await sharp(buffer).rotate().resize(800, null, {withoutEnlargement: true, fit: 'contain'}).webp({quality: 50}).toBuffer();
        fileType = 'image/webp';
      } else {
        return reply.code(415).send(error(501, FILE_TYPE_NOT_SUPPORTED));
      }

      const fileUrl = await upload(buffer, fileType);
      post.asset = {
        fileType: fileType,
        hash: '0x' + arrayBufferKeccak256Hash(buffer),
        hashFunction: 'keccak256(bytes)',
        url: fileUrl
      };

      try {
        return reply.code(200).send({LSPXXProfilePost: post});
        /* eslint-disable */
      } catch (e: any) {
        logError(e);
        reply.code(500).send(error(500, ERROR_INTERNAL));
      }
    }
  });

  fastify.route({
    method: 'POST',
    url: '/post/upload',
    schema: {
      description: 'Upload a post to arweave.',
      tags: ['lookso'],
      summary: 'Upload a post to arweave.'
    },
    handler: async (request, reply) => {
      const body = request.body as { lspXXProfilePost: LSPXXProfilePost, signature: string };
      const jwtError = await verifyJWT(request, reply, body.lspXXProfilePost.author);
      if (jwtError) return jwtError;

      try {
        const post: ProfilePost = {
          LSPXXProfilePost: body.lspXXProfilePost,
          LSPXXProfilePostHash: '0x' + objectToKeccak256Hash(body.lspXXProfilePost),
          LSPXXProfilePostEOASignature: body.signature
        }

        const postUrl = await upload(objectToBuffer(post), 'application/json');

        const registry = await applyChangesToRegistry(body.lspXXProfilePost.author);
        registry.posts.push({url: postUrl, hash: post.LSPXXProfilePostHash});

        const newRegistryUrl = await upload(objectToBuffer(registry), 'application/json');

        return reply.code(200).send({jsonUrl: buildJsonUrl(registry, newRegistryUrl), postHash: post.LSPXXProfilePostHash});
        /* eslint-disable */
      } catch (e: any) {
        logError(e);
        reply.code(500).send(error(500, ERROR_INTERNAL));
      }
    }
  });
}