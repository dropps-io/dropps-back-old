import { FastifyInstance } from 'fastify';

import { poolEnd } from '../../lib/db/database';

export const onCloseHook = async (fastify: FastifyInstance) => {
  fastify.addHook('onClose', async () => {
    await poolEnd();
  });
};
