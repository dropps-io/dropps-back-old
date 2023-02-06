import { FastifyInstance } from 'fastify';

import { HASH_SCHEMA_VALIDATION } from '../../../../models/json/utils.schema';
import { logError } from '../../../../lib/logger';
import { error, ERROR_INTERNAL, ERROR_NOT_FOUND } from '../../../../lib/utils/error-messages';
import { looksoTxService } from './tx.service';

export function looksoTxRoutes(fastify: FastifyInstance) {
  fastify.route({
    method: 'GET',
    url: '/tx/:hash',
    schema: {
      description: 'Get a transaction information.',
      tags: ['lookso', 'transaction'],
      summary: 'Get a transaction information.',
      params: {
        hash: HASH_SCHEMA_VALIDATION,
      },
    },
    handler: async (request, reply) => {
      const { hash } = request.params as { hash: string };

      try {
        const txResponse = await looksoTxService.getTransaction(hash);
        return reply.code(200).send(txResponse);
      } catch (e: any) {
        logError(e);
        if (e === 'No transaction found') return reply.code(404).send(error(404, ERROR_NOT_FOUND));
        return reply.code(500).send(error(500, ERROR_INTERNAL));
      }
    },
  });
}
