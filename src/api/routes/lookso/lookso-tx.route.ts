import { FastifyInstance } from 'fastify';

import { HASH_SCHEMA_VALIDATION } from '../../../models/json/utils.schema';
import { logError } from '../../../lib/logger';
import { error, ERROR_INTERNAL, ERROR_NOT_FOUND } from '../../../lib/utils/error-messages';
import { queryTransaction } from '../../../lib/db/queries/transaction.table';
import { Transaction } from '../../../models/types/transaction';
import {
  DecodedFunctionCall,
  decodeInputParts,
} from '../../../lib/lookso/utils/decode-input-parts';
import { queryContract } from '../../../lib/db/queries/contract.table';
import { queryContractName } from '../../../lib/db/queries/contract-metadata.table';
import { queryImages, queryImagesByType } from '../../../lib/db/queries/image.table';
import { selectImage } from '../../../lib/utils/select-image';

export interface GetTransactionResponse extends Transaction {
  decodedFunctionCallParts: DecodedFunctionCall[];
}

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
      let response: GetTransactionResponse;

      try {
        const tx = await queryTransaction(hash);
        response = { ...tx, decodedFunctionCallParts: [] };
        try {
          response.decodedFunctionCallParts = await decodeInputParts(
            tx.input,
            tx.to ? tx.to : '',
            [],
          );
        } catch (e) {}

        for (let i = 0; i < response.decodedFunctionCallParts.length; i++) {
          try {
            const address = response.decodedFunctionCallParts[i].contract.address;
            const contract = await queryContract(address);
            const name = await queryContractName(address);
            const images =
              contract.interfaceCode === 'LSP0'
                ? await queryImagesByType(address, 'profile')
                : await queryImages(address);
            response.decodedFunctionCallParts[i].contract = {
              address,
              standard: contract.interfaceCode ? contract.interfaceCode : undefined,
              name,
              image: selectImage(images, { minWidthExpected: 210 }).url,
            };
          } catch (e) {}
        }

        return reply.code(200).send(response);
      } catch (e: any) {
        logError(e);
        if (e === 'No transaction found') return reply.code(404).send(error(404, ERROR_NOT_FOUND));
        return reply.code(500).send(error(500, ERROR_INTERNAL));
      }
    },
  });
}
