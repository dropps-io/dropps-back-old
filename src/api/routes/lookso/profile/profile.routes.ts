import { FastifyInstance } from 'fastify';

import { logError } from '../../../../lib/logger';
import {
  error,
  ERROR_INTERNAL,
  ERROR_INVALID_PAGE,
  ERROR_NOT_FOUND,
} from '../../../../lib/utils/error-messages';
import { queryFollowersCount, queryFollowingCount } from '../../../../lib/db/queries/follow.table';
import { queryAddressOfUserTag } from '../../../../lib/db/queries/contract-metadata.table';
import {
  queryNotViewedNotificationsCountOfAddress,
  setViewedToAddressNotifications,
} from '../../../../lib/db/queries/notification.table';
import { verifyJWT } from '../../../../lib/json-web-token';
import { applyChangesToRegistry } from '../../../../lib/lookso/registry/apply-changes-to-registry';
import { objectToBuffer } from '../../../../lib/utils/file-converters';
import { uploadToArweave } from '../../../../lib/arweave/utils/uploadToArweave';
import { buildJsonUrl } from '../../../../lib/utils/json-url';
import { deleteAddressRegistryChanges } from '../../../../lib/db/queries/registry-change.table';
import {
  ADDRESS_SCHEMA_VALIDATION,
  PAGE_SCHEMA_VALIDATION,
  POST_TYPE_SCHEMA_VALIDATION,
} from '../../../../models/json/utils.schema';
import { API_URL } from '../../../../environment/config';
import { looksoProfileService } from './profile.service';

export function looksoProfileRoutes(fastify: FastifyInstance) {
  fastify.route({
    method: 'GET',
    url: '/profile/:address/activity',
    schema: {
      description: 'Get posts linked to a profile.',
      tags: ['lookso'],
      querystring: {
        page: PAGE_SCHEMA_VALIDATION,
        postType: POST_TYPE_SCHEMA_VALIDATION,
        viewOf: ADDRESS_SCHEMA_VALIDATION,
      },
      params: {
        address: ADDRESS_SCHEMA_VALIDATION,
      },
      summary: 'Get profile feed.',
    },
    handler: async (request, reply) => {
      const { address } = request.params as { address: string };
      const { page, postType, viewOf } = request.query as {
        page?: number;
        postType?: 'event' | 'post';
        viewOf?: string;
      };

      const queryUrl = `${API_URL}/lookso/profile/${address}/activity?${
        postType ? 'postType=' + postType + '&' : ''
      }${viewOf ? 'viewOf=' + viewOf + '&' : ''}page=`;

      try {
        const profileActivityResponse = await looksoProfileService.getProfileActivity(
          address,
          queryUrl,
          postType,
          page,
          viewOf,
        );

        return reply.code(200).send(profileActivityResponse);
      } catch (e: any) {
        if (JSON.stringify(e).includes(ERROR_INVALID_PAGE))
          return reply.code(400).send(error(400, ERROR_INVALID_PAGE));

        logError(e);
        reply.code(500).send(error(500, ERROR_INTERNAL));
      }
    },
  });

  fastify.route({
    method: 'GET',
    url: '/profile/:address/feed',
    schema: {
      description: 'Get posts linked to a profile.',
      tags: ['lookso'],
      querystring: {
        page: { type: 'number', minimum: 0 },
        postType: { enum: ['post', 'event'] },
      },
      params: {
        address: ADDRESS_SCHEMA_VALIDATION,
      },
      summary: 'Get profile feed.',
    },
    handler: async (request, reply) => {
      const { address } = request.params as { address: string };
      const { page, postType } = request.query as { page?: number; postType?: 'event' | 'post' };

      const queryUrl = `${API_URL}/lookso/profile/${address}/feed?${
        postType ? 'postType=' + postType + '&' : ''
      }page=`;

      try {
        const getProfileResponse = await looksoProfileService.getProfileFeed(
          address,
          queryUrl,
          postType,
          page,
        );

        return reply.code(200).send(getProfileResponse);
      } catch (e: any) {
        if (JSON.stringify(e).includes(ERROR_INVALID_PAGE))
          return reply.code(400).send(error(400, ERROR_INVALID_PAGE));

        logError(e);
        reply.code(500).send(error(500, ERROR_INTERNAL));
      }
    },
  });

  fastify.route({
    method: 'GET',
    url: '/profile/:address',
    schema: {
      description: 'Get profile name, description, picture, tags, links and background.',
      tags: ['lookso'],
      summary: 'Get profile info.',
      params: {
        address: ADDRESS_SCHEMA_VALIDATION,
      },
    },
    handler: async (request, reply) => {
      const { address } = request.params as { address: string };

      try {
        const profile = await looksoProfileService.getProfile(address);
        return reply.code(200).send(profile);
      } catch (e: any) {
        if (JSON.stringify(e).includes(ERROR_NOT_FOUND))
          return reply.code(404).send(error(404, ERROR_NOT_FOUND));
        logError(e);
        return reply.code(500).send(error(500, ERROR_INTERNAL));
      }
    },
  });

  fastify.route({
    method: 'GET',
    url: '/profile/:username/:digits',
    schema: {
      description: 'Get profile name, description, picture, tags, links and background.',
      tags: ['lookso'],
      summary: 'Get profile info.',
    },
    handler: async (request, reply) => {
      const { username, digits } = request.params as { username: string; digits: string };

      try {
        let address;
        try {
          address = await queryAddressOfUserTag(username, digits);
        } catch (e) {
          logError(e);
          return reply.code(404).send(error(404, ERROR_NOT_FOUND));
        }

        return reply.code(200).send({ address });
      } catch (e: any) {
        logError(e);
        reply.code(500).send(error(500, ERROR_INTERNAL));
      }
    },
  });

  fastify.route({
    method: 'GET',
    url: '/profile/:address/following/count',
    schema: {
      description: 'Get profile following count.',
      tags: ['lookso'],
      summary: 'Get profile following count.',
      params: {
        address: ADDRESS_SCHEMA_VALIDATION,
      },
    },
    handler: async (request, reply) => {
      const { address } = request.params as { address: string };

      try {
        const following: number = await queryFollowingCount(address);
        return reply.code(200).send({ following });
      } catch (e: any) {
        logError(e);
        reply.code(500).send(error(500, ERROR_INTERNAL));
      }
    },
  });

  fastify.route({
    method: 'GET',
    url: '/profile/:address/followers',
    schema: {
      description: 'Get profile followers list.',
      tags: ['lookso'],
      summary: 'Get profile followers list.',
      querystring: {
        page: PAGE_SCHEMA_VALIDATION,
        follower: ADDRESS_SCHEMA_VALIDATION,
        viewOf: ADDRESS_SCHEMA_VALIDATION,
      },
      params: {
        address: ADDRESS_SCHEMA_VALIDATION,
      },
    },
    handler: async (request, reply) => {
      const { address } = request.params as { address: string };
      const { follower, page, viewOf } = request.query as {
        follower?: string;
        page?: number;
        viewOf?: string;
      };

      const queryUrl = `${API_URL}/lookso/profile/${address}/followers?${
        follower ? 'follower=' + follower + '&' : ''
      }${viewOf ? 'viewOf=' + viewOf + '&' : ''}page=`;

      try {
        const profileFollowersResponse = await looksoProfileService.getProfileFollowers(
          address,
          queryUrl,
          page,
          follower,
          viewOf,
        );

        return reply.code(200).send(profileFollowersResponse);
      } catch (e: any) {
        if (JSON.stringify(e).includes(ERROR_INVALID_PAGE))
          reply.code(400).send(error(400, ERROR_INVALID_PAGE));
        logError(e);
        reply.code(500).send(error(500, ERROR_INTERNAL));
      }
    },
  });

  fastify.route({
    method: 'GET',
    url: '/profile/:address/followers/count',
    schema: {
      description: 'Get profile followers count.',
      tags: ['lookso'],
      summary: 'Get profile followers count.',
      params: {
        address: ADDRESS_SCHEMA_VALIDATION,
      },
    },
    handler: async (request, reply) => {
      const { address } = request.params as { address: string };

      try {
        const followers: number = await queryFollowersCount(address);
        return reply.code(200).send({ followers });
      } catch (e: any) {
        logError(e);
        reply.code(500).send(error(500, ERROR_INTERNAL));
      }
    },
  });

  fastify.route({
    method: 'GET',
    url: '/profile/:address/following',
    schema: {
      description: 'Get profile follow list with address, name and profile pictures.',
      tags: ['lookso'],
      querystring: {
        page: { type: 'number', minimum: 0 },
        viewOf: ADDRESS_SCHEMA_VALIDATION,
      },
      params: {
        address: ADDRESS_SCHEMA_VALIDATION,
      },
      summary: 'Get all the profiles a user is following.',
    },
    handler: async (request, reply) => {
      const { address } = request.params as { address: string };
      const { page, viewOf } = request.query as { page?: number; viewOf?: string };

      const queryUrl = `${API_URL}/lookso/profile/${address}/following?${
        viewOf ? 'viewOf=' + viewOf + '&' : ''
      }page=`;

      try {
        const profileFollowingResponse = await looksoProfileService.getProfileFollowing(
          address,
          queryUrl,
          page,
          viewOf,
        );

        return reply.code(200).send(profileFollowingResponse);
      } catch (e: any) {
        logError(e);

        if (JSON.stringify(e).includes(ERROR_INVALID_PAGE))
          return reply.code(400).send(error(400, ERROR_INVALID_PAGE));
        return reply.code(500).send(error(500, ERROR_INTERNAL));
      }
    },
  });

  fastify.route({
    method: 'GET',
    url: '/profile/:address/assets',
    schema: {
      description: 'Get profile assets list with address, name, image, and balance.',
      tags: ['lookso', 'profile'],
      params: {
        address: ADDRESS_SCHEMA_VALIDATION,
      },
      summary: 'Get all the assets owned by a profile.',
    },
    handler: async (request, reply) => {
      const { address } = request.params as { address: string };

      try {
        const assets = await looksoProfileService.getProfileAssets(address);
        return reply.code(200).send(assets);
      } catch (e: any) {
        logError(e);
        reply.code(500).send(error(500, ERROR_INTERNAL));
      }
    },
  });

  fastify.route({
    method: 'GET',
    url: '/profile/:address/notifications',
    schema: {
      description: 'Get notifications of an address.',
      tags: ['lookso'],
      querystring: {
        page: PAGE_SCHEMA_VALIDATION,
      },
      params: {
        address: ADDRESS_SCHEMA_VALIDATION,
      },
      summary: 'Get notifications of an address.',
    },
    handler: async (request, reply) => {
      const { address } = request.params as { address: string };
      const { page } = request.query as { page?: number };
      const queryUrl = `${API_URL}/lookso/profile/${address}/notifications?page=`;

      try {
        const notifications = await looksoProfileService.getProfileNotifications(
          address,
          queryUrl,
          page,
        );
        return reply.code(200).send(notifications);
      } catch (e: any) {
        logError(e);
        reply.code(500).send(error(500, ERROR_INTERNAL));
      }
    },
  });

  fastify.route({
    method: 'GET',
    url: '/profile/:address/notifications/count',
    schema: {
      description: 'Get unviewed notifications count of an address.',
      tags: ['lookso'],
      summary: 'Get unviewed notifications count of an address.',
      params: {
        address: ADDRESS_SCHEMA_VALIDATION,
      },
    },
    handler: async (request, reply) => {
      const { address } = request.params as { address: string };

      try {
        const notificationsCount: number = await queryNotViewedNotificationsCountOfAddress(address);

        return reply.code(200).send({ notifications: notificationsCount });
      } catch (e: any) {
        logError(e);
        reply.code(500).send(error(500, ERROR_INTERNAL));
      }
    },
  });

  fastify.route({
    method: 'PUT',
    url: '/profile/:address/notifications',
    schema: {
      description: 'Set all the notifications as viewed.',
      tags: ['lookso'],
      summary: 'Set all the notifications as viewed.',
      params: {
        address: ADDRESS_SCHEMA_VALIDATION,
      },
    },
    handler: async (request, reply) => {
      const { address } = request.params as { address: string };
      const jwtError = await verifyJWT(request, reply, address);
      if (jwtError) return jwtError;

      try {
        await setViewedToAddressNotifications(address);

        return reply.code(200).send();
      } catch (e: any) {
        logError(e);
        if (JSON.stringify(e).includes(ERROR_INVALID_PAGE))
          return reply.code(400).send(error(400, ERROR_INVALID_PAGE));
        reply.code(500).send(error(500, ERROR_INTERNAL));
      }
    },
  });

  fastify.route({
    method: 'POST',
    url: '/profile/:address/registry',
    schema: {
      description: 'Upload and get the new registry JSONURL.',
      tags: ['lookso'],
      summary: 'Upload and get the new registry JSONURL.',
      params: {
        address: ADDRESS_SCHEMA_VALIDATION,
      },
    },
    handler: async (request, reply) => {
      const { address } = request.params as { address: string };
      const jwtError = await verifyJWT(request, reply, address);
      if (jwtError) return jwtError;

      try {
        const registry = await applyChangesToRegistry(address);
        const newRegistryUrl = await uploadToArweave(objectToBuffer(registry), 'application/json');

        return reply.code(200).send({ jsonUrl: buildJsonUrl(registry, newRegistryUrl) });
      } catch (e: any) {
        logError(e);
        reply.code(500).send(error(500, ERROR_INTERNAL));
      }
    },
  });

  fastify.route({
    method: 'POST',
    url: '/profile/:address/registry/uploaded',
    schema: {
      description: 'Remove all the current registry pending changes.',
      tags: ['lookso'],
      summary: 'Remove all the current registry pending changes.',
      params: {
        address: ADDRESS_SCHEMA_VALIDATION,
      },
    },
    handler: async (request, reply) => {
      const { address } = request.params as { address: string };
      const jwtError = await verifyJWT(request, reply, address);
      if (jwtError) return jwtError;

      try {
        await deleteAddressRegistryChanges(address);

        return reply.code(200).send();
      } catch (e: any) {
        logError(e);
        reply.code(500).send(error(500, ERROR_INTERNAL));
      }
    },
  });
}
