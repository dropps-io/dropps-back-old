import {isAddress} from "../../bin/utils/validators";
import {ADR_INVALID, INTERNAL} from "../../bin/utils/error-messages";
import {queryUsersOfProfile} from "../../bin/db/user-profile-relations.table";
import {FastifyInstance} from "fastify";

export async function profilesRoute (fastify: FastifyInstance) {

  fastify.route({
    method: 'GET',
    url: '/:profileAddress/users',
    handler: async (request, reply) => {
      try {
        const {profileAddress} = request.params as { profileAddress: string };
        if (!isAddress(profileAddress)) return reply.code(400).send(ADR_INVALID);
        const users: string[] = await queryUsersOfProfile(profileAddress);
        return reply.code(200).send(users);
        /* eslint-disable */
      } catch (e: any) {
        console.error(e);
        return reply.code(500).send(INTERNAL);
      }
    }
  });

}
