import {queryPostLike, queryPostLikesWithNames} from "../../../bin/db/like.table";
import {queryImagesByType} from "../../../bin/db/image.table";
import {selectImage} from "../../../bin/utils/select-image";
import {logError} from "../../../bin/logger";
import {error, ERROR_INTERNAL} from "../../../bin/utils/error-messages";
import {LSPXXProfilePost, ProfilePost} from "../../../bin/lookso/registry/types/profile-post";
import {verifyJWT} from "../../../bin/json-web-token";
import sharp from "sharp";
import {arrayBufferKeccak256Hash, objectToBuffer, objectToKeccak256Hash} from "../../../bin/utils/file-converters";
import {buildJsonUrl} from "../../../bin/utils/json-url";
import {FastifyInstance} from "fastify";
import {queryPost, queryPostComments} from "../../../bin/db/post.table";
import {FeedPost} from "../../../models/types/feed-post";
import {constructFeed} from "../../../bin/lookso/feed/construct-feed";
import {Post} from "../../../models/types/post";
import {applyChangesToRegistry} from "../../../bin/lookso/registry/apply-changes-to-registry";
import {upload} from "../../../bin/arweave/utils/upload";
import multer from "fastify-multer";

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
        viewOf: { type: 'string' },
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
        limit: { type: 'number' },
        offset: { type: 'number' }
      }
    },
    handler: async (request, reply) => {
      const {hash} = request.params as { hash: string};
      const {sender, limit, offset} = request.query as {sender?:string, limit: number, offset: number};

      try {
        if (sender) {
          const isLiking = await queryPostLike(sender, hash);
          reply.code(200).send(isLiking ? [sender] : []);
        } else {
          const response = [];

          const likes = await queryPostLikesWithNames(hash, limit, offset);
          for (let like of likes) {
            const images = await queryImagesByType(like.address, 'profile');
            response.push({...like, image: selectImage(images, {minWidthExpected: 50})});
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
    url: '/post/:hash/comments',
    schema: {
      description: 'Get post comments.',
      tags: ['lookso'],
      querystring: {
        limit: { type: 'number' },
        offset: { type: 'number' },
        viewOf: { type: 'string' },
      },
      summary: 'Get post comments.',
    },
    handler: async (request, reply) => {
      const {hash} = request.params as { hash: string };
      const {limit, offset, viewOf} = request.query as { limit: number, offset: number, viewOf?: string };

      try {
        const posts: Post[] = await queryPostComments(hash, limit, offset);
        const feed = await constructFeed(posts, viewOf, true);

        return reply.code(200).send(feed);
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
      summary: 'Upload a media to arweave.'
    },
    handler: async (request, reply) => {
      const body = request.body as { lspXXProfilePost: string};
      const documentFile: any = (request as unknown as MulterRequest).file;
      const post: LSPXXProfilePost = JSON.parse(body.lspXXProfilePost) as LSPXXProfilePost;

      await verifyJWT(request, reply, post.author);

      let buffer = documentFile.buffer;
      let fileType = documentFile.mimetype;

      if (fileType.includes('image')) {
        buffer = await sharp(buffer).rotate().resize(800, null, {withoutEnlargement: true, fit: 'contain'}).webp({quality: 50}).toBuffer();
        fileType = 'image/webp';
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

      try {
        await verifyJWT(request, reply, body.lspXXProfilePost.author);

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