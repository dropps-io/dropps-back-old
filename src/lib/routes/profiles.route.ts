import {isAddress} from '../../bin/utils/validators';
import {error, ERROR_ADR_INVALID, ERROR_INTERNAL, ERROR_PROFILE_NOT_FOUND} from '../../bin/utils/error-messages';
import {queryUsersOfProfile} from '../../bin/db/user-profile-relations.table';
import {FastifyInstance} from 'fastify';
import {logError} from '../../bin/logger';

export async function profilesRoute (fastify: FastifyInstance) {

	fastify.route({
		method: 'GET',
		url: '/:profileAddress/users',
		schema: {
			description: 'Get all saved users addresses of a specific profile.',
			tags: ['profiles'],
			summary: 'Get users of a profile',
		},
		handler: async (request, reply) => {
			try {
				const {profileAddress} = request.params as { profileAddress: string };
				if (!isAddress(profileAddress)) return reply.code(400).send(error(400, ERROR_ADR_INVALID));
				const users: string[] = await queryUsersOfProfile(profileAddress);
				if (users.length === 0) return reply.code(404).send(error(404, ERROR_PROFILE_NOT_FOUND));
				return reply.code(200).send(users);
				/* eslint-disable */
      } catch (e: any) {
        logError(e);
        return reply.code(500).send(error(500, ERROR_INTERNAL));
      }
    }
  });

}
