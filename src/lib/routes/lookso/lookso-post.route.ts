import {queryPostLikesWithNames} from "../../../bin/db/like.table";
import {queryImagesByType} from "../../../bin/db/image.table";
import {selectImage} from "../../../bin/utils/select-image";
import {logError} from "../../../bin/logger";
import {error, ERROR_INTERNAL} from "../../../bin/utils/error-messages";
import {LSPXXProfilePost, ProfilePost} from "../../../bin/lookso/registry/types/profile-post";
import {verifyJWT} from "../../../bin/json-web-token";
import {Buffer} from "buffer";
import {arweaveTxToUrl} from "../../../bin/arweave/arweave-utils";
import {arrayBufferKeccak256Hash, objectToBuffer, objectToKeccak256Hash} from "../../../bin/utils/file-converters";
import {SocialRegistry} from "../../../bin/lookso/registry/types/social-registry";
import {getProfileRegistry} from "../../../bin/lookso/registry/utils/get-address-registry";
import {buildJsonUrl} from "../../../bin/utils/json-url";
import {FastifyInstance} from "fastify";
import {ArweaveClient} from "../../../bin/arweave/ArweaveClient.class";

const arweave = new ArweaveClient();

export function looksoPostRoutes(fastify: FastifyInstance) {
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

  fastify.route({
    method: 'POST',
    url: '/post/request-object',
    schema: {
      description: 'Upload a media to arweave.',
      tags: ['lookso'],
      summary: 'Upload a media to arweave.'
    },
    handler: async (request, reply) => {
      const body = request.body as { lspXXProfilePost: LSPXXProfilePost, fileType:string, base64File: string };
      await verifyJWT(request, reply, body.lspXXProfilePost.author);

      const post: LSPXXProfilePost = body.lspXXProfilePost;

      const buffer = Buffer.from(body.base64File.split(',')[1], 'base64url');
      const txId = await arweave.upload(buffer, body.fileType);
      const fileUrl = arweaveTxToUrl(txId);

      post.asset = {
        fileType: body.fileType,
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
      await verifyJWT(request, reply, body.lspXXProfilePost.author);

      const post: ProfilePost = {
        LSPXXProfilePost: body.lspXXProfilePost,
        LSPXXProfilePostHash: '0x' + objectToKeccak256Hash(body.lspXXProfilePost),
        LSPXXProfilePostEOASignature: body.signature
      }
      const postUrl = arweaveTxToUrl(await arweave.upload(objectToBuffer(post), 'application/json'));

      const registry: SocialRegistry = await getProfileRegistry(post.LSPXXProfilePost.author);
      console.log(registry)
      registry.posts.push({url: postUrl, hash: post.LSPXXProfilePostHash});

      const newRegistryUrl = arweaveTxToUrl(await arweave.upload(objectToBuffer(registry), 'application/json'));

      try {
        return reply.code(200).send({jsonUrl: buildJsonUrl(registry, newRegistryUrl), postHash: post.LSPXXProfilePostHash});
        /* eslint-disable */
      } catch (e: any) {
        logError(e);
        reply.code(500).send(error(500, ERROR_INTERNAL));
      }
    }
  });
}