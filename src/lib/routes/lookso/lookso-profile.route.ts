import {Post} from "../../../models/types/post";
import {queryPostsOfUser, queryPostsOfUserCount, queryPostsOfUsers, queryPostsOfUsersCount} from "../../../bin/db/post.table";
import {constructFeed} from "../../../bin/lookso/feed/construct-feed";
import {logError} from "../../../bin/logger";
import {error, ERROR_ADR_INVALID, ERROR_INTERNAL, ERROR_INVALID_PAGE, ERROR_NOT_FOUND} from "../../../bin/utils/error-messages";
import {
  queryFollow, queryFollowersCount, queryFollowersWithNames,
  queryFollowing,
  queryFollowingCount, queryFollowingWithNames
} from "../../../bin/db/follow.table";
import {queryContractMetadata, queryAddressOfUserTag, queryContractName} from "../../../bin/db/contract-metadata.table";
import {queryTags} from "../../../bin/db/tag.table";
import {queryLinks} from "../../../bin/db/link.table";
import {queryImages, queryImagesByType} from "../../../bin/db/image.table";
import {selectImage} from "../../../bin/utils/select-image";
import {FastifyInstance} from "fastify";
import {isAddress} from "../../../bin/utils/validators";
import {
  queryNotificationsCountOfAddress,
  queryNotificationsOfAddress, queryNotViewedNotificationsCountOfAddress,
  setViewedToAddressNotifications
} from "../../../bin/db/notification.table";
import {NotificationWithSenderDetails} from "../../../models/types/notification";
import {verifyJWT} from "../../../bin/json-web-token";
import {applyChangesToRegistry} from "../../../bin/lookso/registry/apply-changes-to-registry";
import {objectToBuffer} from "../../../bin/utils/file-converters";
import {upload} from "../../../bin/arweave/utils/upload";
import {buildJsonUrl} from "../../../bin/utils/json-url";
import {deleteAddressRegistryChanges} from "../../../bin/db/registry-change.table";
import {ADDRESS_SCHEMA_VALIDATION} from "../../../models/json/utils.schema";
import {API_URL, COMMENTS_PER_LOAD, NOTIFICATIONS_PER_LOAD, POSTS_PER_LOAD, PROFILES_PER_LOAD} from "../../../environment/config";


export function looksoProfileRoutes(fastify: FastifyInstance) {
  fastify.route({
    method: 'GET',
    url: '/profile/:address/activity',
    schema: {
      description: 'Get posts linked to a profile.',
      tags: ['lookso'],
      querystring: {
        page: { type: 'number', minimum: 0 },
        postType: { enum: ['post', 'event'] },
        viewOf: ADDRESS_SCHEMA_VALIDATION,
      },
      summary: 'Get profile feed.',
    },
    handler: async (request, reply) => {
      const {address} = request.params as { address: string };
      const query = request.query as { page?: number, postType?: 'event' | 'post', viewOf?: string };
      if (!isAddress(address)) reply.code(400).send(error(400, ERROR_ADR_INVALID));

      try {
        const count = await queryPostsOfUserCount(address, query.postType);
        const page = query.page ? query.page : Math.ceil(count / POSTS_PER_LOAD) - 1;
        if (page >= count / POSTS_PER_LOAD) return reply.code(400).send(error(400, ERROR_INVALID_PAGE));
        const posts: Post[] = await queryPostsOfUser(address, POSTS_PER_LOAD, page * POSTS_PER_LOAD, query.postType);
        const feed = await constructFeed(posts, query.viewOf);

        const queryUrl = `${API_URL}/lookso/profile/${address}/activity?${query.postType ? 'postType=' + query.postType + '&' : ''}${query.viewOf ? 'viewOf=' + query.viewOf + '&' : ''}page=`;

        return reply.code(200).send({
          count,
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
    url: '/profile/:address/feed',
    schema: {
      description: 'Get posts linked to a profile.',
      tags: ['lookso'],
      querystring: {
        page: { type: 'number', minimum: 0 },
        postType: { enum: ['post', 'event'] },
      },
      summary: 'Get profile feed.',
    },
    handler: async (request, reply) => {
      const {address} = request.params as { address: string };
      const query = request.query as { page?: number, postType?: 'event' | 'post' };
      if (!isAddress(address)) reply.code(400).send(error(400, ERROR_ADR_INVALID));

      try {
        const followingList = await queryFollowing(address);
        if (followingList.length === 0) return reply.code(200).send({
          count: 0,
          next: null,
          previous: null,
          results: []
        });

        const count = await queryPostsOfUsersCount(followingList, query.postType);
        const page = query.page ? query.page : Math.ceil(count / POSTS_PER_LOAD) - 1;
        if (page >= count / POSTS_PER_LOAD) return reply.code(400).send(error(400, ERROR_INVALID_PAGE));
        const posts: Post[] = await queryPostsOfUsers(followingList, POSTS_PER_LOAD, page * POSTS_PER_LOAD, query.postType);
        const feed = await constructFeed(posts, address);

        const queryUrl = `${API_URL}/lookso/profile/${address}/feed?${query.postType ? 'postType=' + query.postType + '&' : ''}page=`;

        return reply.code(200).send({
          count,
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
    url: '/profile/:address',
    schema: {
      description: 'Get profile name, description, picture, tags, links and background.',
      tags: ['lookso'],
      summary: 'Get profile info.',
    },
    handler: async (request, reply) => {
      const {address} = request.params as { address: string };
      if (!isAddress(address)) reply.code(400).send(error(400, ERROR_ADR_INVALID));

      try {
        let metadata;
        try {
          metadata = await queryContractMetadata(address);
        } catch (e) {
          logError(e);
          return reply.code(404).send(error(404, ERROR_NOT_FOUND));
        }

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
    url: '/profile/:username/:digits',
    schema: {
      description: 'Get profile name, description, picture, tags, links and background.',
      tags: ['lookso'],
      summary: 'Get profile info.',
    },
    handler: async (request, reply) => {
      const {username, digits} = request.params as { username: string, digits: string };

      try {
        let address;
        try {
          address = await queryAddressOfUserTag(username, digits);
        } catch (e) {
          logError(e);
          return reply.code(404).send(error(404, ERROR_NOT_FOUND));
        }

        return reply.code(200).send({address});
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
    url: '/profile/:address/followers',
    schema: {
      description: 'Get profile followers list.',
      tags: ['lookso'],
      summary: 'Get profile followers list.',
      querystring: {
        page: { type: 'number', minimum: 0 },
        follower: ADDRESS_SCHEMA_VALIDATION,
        viewOf: ADDRESS_SCHEMA_VALIDATION,
      }
    },
    handler: async (request, reply) => {
      const {address} = request.params as { address: string};
      const query = request.query as {follower?:string, page?: number, viewOf?: string};
      const page = query.page ? query.page : 0;
      if (!isAddress(address)) return reply.code(400).send(error(400, ERROR_ADR_INVALID));

      try {
        if (query.follower) {
          const isFollower = await queryFollow(query.follower, address);
          return reply.code(200).send(isFollower ? {
            count: 1,
            next: null,
            previous: null,
            results: [query.follower]
          } : {
            count: 0,
            next: null,
            previous: null,
            results: []
          });
        }
        else {
          const response = [];
          const count = await queryFollowersCount(address);
          if (page >= count / PROFILES_PER_LOAD) return reply.code(400).send(error(400, ERROR_INVALID_PAGE));
          const followers = await queryFollowersWithNames(address, PROFILES_PER_LOAD, page * PROFILES_PER_LOAD);
          for (let follower of followers) {
            const images = await queryImagesByType(follower.address, 'profile');
            const selectedImage = selectImage(images, {minWidthExpected: 50});
            const following = query.viewOf ? await queryFollow(query.viewOf, follower.address) : undefined;
            response.push({...follower, image: selectedImage ? selectedImage.url : '', following});
          }

          const queryUrl = `${API_URL}/lookso/profile/${address}/followers?${query.follower ? 'follower=' + query.follower + '&' : ''}${query.viewOf ? 'viewOf=' + query.viewOf + '&' : ''}page=`;

          return reply.code(200).send({
            count,
            next: page < Math.ceil(count / PROFILES_PER_LOAD) - 1 ? queryUrl + (page + 1).toString() : null,
            previous: page > 0 ? queryUrl + (page - 1).toString() : null,
            results: response
          });
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
        page: { type: 'number', minimum: 0 },
        viewOf: ADDRESS_SCHEMA_VALIDATION,
      },
      summary: 'Get all the profiles a user is following.',
    },
    handler: async (request, reply) => {
      const {address} = request.params as { address: string };
      const query = request.query as {page?: number, viewOf?: string};
      const page = query.page ? query.page : 0;
      if (!isAddress(address)) return reply.code(400).send(error(400, ERROR_ADR_INVALID));

      try {
        const response = [];
        const count = await queryFollowingCount(address);
        if (page >= count / PROFILES_PER_LOAD) return reply.code(400).send(error(400, ERROR_INVALID_PAGE));
        const following = await queryFollowingWithNames(address, PROFILES_PER_LOAD, page * PROFILES_PER_LOAD);
        for (let followingProfile of following) {
          const images = await queryImagesByType(followingProfile.address, 'profile');
          const selectedImage = selectImage(images, {minWidthExpected: 50});
          const following = query.viewOf ? await queryFollow(query.viewOf, followingProfile.address) : undefined;
          response.push({...followingProfile, image: selectedImage ? selectedImage.url : '', following});
        }
        const queryUrl = `${API_URL}/lookso/profile/${address}/following?${query.viewOf ? 'viewOf=' + query.viewOf + '&' : ''}page=`;

        return reply.code(200).send({
          count,
          next: page < Math.ceil(count / PROFILES_PER_LOAD) - 1 ? queryUrl + (page + 1).toString() : null,
          previous: page > 0 ? queryUrl + (page - 1).toString() : null,
          results: response
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
    url: '/profile/:address/notifications',
    schema: {
      description: 'Get notifications of an address.',
      tags: ['lookso'],
      querystring: {
        page: { type: 'number', minimum: 0 },
      },
      summary: 'Get notifications of an address.',
    },
    handler: async (request, reply) => {
      const {address} = request.params as { address: string };
      if (!isAddress(address)) reply.code(400).send(error(400, ERROR_ADR_INVALID));
      const query = request.query as {page: number};

      try {
        const count = await queryNotificationsCountOfAddress(address);
        const page = query.page ? query.page : Math.ceil(count / NOTIFICATIONS_PER_LOAD) - 1;
        if (page >= count / NOTIFICATIONS_PER_LOAD) return reply.code(400).send(error(400, ERROR_INVALID_PAGE));
        const notifications = await queryNotificationsOfAddress(address, NOTIFICATIONS_PER_LOAD, page * NOTIFICATIONS_PER_LOAD);
        const response: NotificationWithSenderDetails[] = [];

        for (const notification of notifications) {
          let name: string;
          try {
            name = (await queryContractName(notification.sender));
          } catch (e) {
            name = '';
          }
          const images = await queryImagesByType(notification.sender, 'profile');
          response.push({
            address: notification.address,
            date: notification.date,
            postHash: notification.postHash,
            viewed: notification.viewed,
            type: notification.type,
            sender: {
              address: notification.sender,
              name: name,
              image: images.length > 0 ? selectImage(images, {minWidthExpected: 50}).url : ''
            }
          });
        }

        const queryUrl = `${API_URL}/profile/${address}/notifications?page=`;

        return reply.code(200).send({
          count,
          next: page < Math.ceil(count / COMMENTS_PER_LOAD) - 1 ? queryUrl + (page + 1).toString() : null,
          previous: page > 0 ? queryUrl + (page - 1).toString() : null,
          results: response
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
    url: '/profile/:address/notifications/count',
    schema: {
      description: 'Get unviewed notifications count of an address.',
      tags: ['lookso'],
      summary: 'Get unviewed notifications count of an address.',
    },
    handler: async (request, reply) => {
      const {address} = request.params as { address: string };
      if (!isAddress(address)) reply.code(400).send(error(400, ERROR_ADR_INVALID));

      try {
        const notificationsCount: number = await queryNotViewedNotificationsCountOfAddress(address);

        return reply.code(200).send({notifications: notificationsCount});
        /* eslint-disable */
      } catch (e: any) {
        logError(e);
        reply.code(500).send(error(500, ERROR_INTERNAL));
      }
    }
  });

  fastify.route({
    method: 'PUT',
    url: '/profile/:address/notifications',
    schema: {
      description: 'Set all the notifications as viewed.',
      tags: ['lookso'],
      summary: 'Set all the notifications as viewed.',
    },
    handler: async (request, reply) => {
      const {address} = request.params as { address: string };
      if (!isAddress(address)) reply.code(400).send(error(400, ERROR_ADR_INVALID));
      const jwtError = await verifyJWT(request, reply, address);
      if (jwtError) return jwtError;

      try {
        await setViewedToAddressNotifications(address);

        return reply.code(200).send();
        /* eslint-disable */
      } catch (e: any) {
        logError(e);
        reply.code(500).send(error(500, ERROR_INTERNAL));
      }
    }
  });

  fastify.route({
    method: 'POST',
    url: '/profile/:address/registry',
    schema: {
      description: 'Upload and get the new registry JSONURL.',
      tags: ['lookso'],
      summary: 'Upload and get the new registry JSONURL.',
    },
    handler: async (request, reply) => {
      const {address} = request.params as { address: string };
      if (!isAddress(address)) reply.code(400).send(error(400, ERROR_ADR_INVALID));
      const jwtError = await verifyJWT(request, reply, address);
      if (jwtError) return jwtError;

      try {
        const registry = await applyChangesToRegistry(address);
        const newRegistryUrl = await upload(objectToBuffer(registry), 'application/json');

        return reply.code(200).send({jsonUrl: buildJsonUrl(registry, newRegistryUrl)});
        /* eslint-disable */
      } catch (e: any) {
        logError(e);
        reply.code(500).send(error(500, ERROR_INTERNAL));
      }
    }
  });

  fastify.route({
    method: 'POST',
    url: '/profile/:address/registry/uploaded',
    schema: {
      description: 'Remove all the current registry pending changes.',
      tags: ['lookso'],
      summary: 'Remove all the current registry pending changes.',
    },
    handler: async (request, reply) => {
      const {address} = request.params as { address: string };
      if (!isAddress(address)) reply.code(400).send(error(400, ERROR_ADR_INVALID));
      const jwtError = await verifyJWT(request, reply, address);
      if (jwtError) return jwtError;

      try {
        await deleteAddressRegistryChanges(address);

        return reply.code(200).send();
        /* eslint-disable */
      } catch (e: any) {
        logError(e);
        reply.code(500).send(error(500, ERROR_INTERNAL));
      }
    }
  });
}