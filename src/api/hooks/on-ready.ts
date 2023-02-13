import { FastifyInstance } from 'fastify';

import { poolConnect } from '../../lib/db/database';

export const onReadyHook = async (fastify: FastifyInstance) => {
  fastify.addHook('onReady', async () => {
    await poolConnect();
  });
};
