import { FastifyInstance } from 'fastify';

import { PAGE_SCHEMA_VALIDATION } from '../../../../models/json/utils.schema';
import { handleError } from '../../../utils/handle-error';
import { API_URL, PROFILES_PER_SEARCH } from '../../../../environment/config';
import { looksoSearchService } from './search.service';

export function looksoSearchRoutes(fastify: FastifyInstance) {
  fastify.route({
    method: 'GET',
    url: '/search/:input',
    schema: {
      description: 'Search in our database with an input.',
      tags: ['lookso'],
      querystring: {
        page: PAGE_SCHEMA_VALIDATION,
      },
      summary: 'Search in our database with an input.',
    },
    handler: async (request, reply) => {
      const { input } = request.params as { input: string };
      const query = request.query as { page?: number };
      const page = query.page ? query.page : 0;

      try {
        const searchResults = await looksoSearchService.search(input, page);

        const queryUrl = `${API_URL}/lookso/search/${input}?page=`;

        return reply.code(200).send({
          search: searchResults,
          next:
            page < Math.ceil(searchResults.profiles.count / PROFILES_PER_SEARCH) - 1
              ? queryUrl + (page + 1).toString()
              : null,
          previous: page > 0 ? queryUrl + (page - 1).toString() : null,
        });
      } catch (e: any) {
        return handleError(e, reply);
      }
    },
  });
}
