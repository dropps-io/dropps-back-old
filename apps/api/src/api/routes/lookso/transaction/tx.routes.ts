import { FastifyInstance } from 'fastify';

import { HASH_SCHEMA_VALIDATION } from '../../../../models/json/utils.schema';
import { looksoTxService } from './tx.service';
import { handleError } from '../../../utils/handle-error';

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
        return handleError(e, reply);
      }
    },
  });
}
