import { FastifyReply } from 'fastify';

import { logError } from '../../lib/logger';
import {
  error,
  ERROR_INCORRECT_SIGNED_NONCE,
  ERROR_INTERNAL,
  ERROR_INVALID_PAGE,
  ERROR_INVALID_SIGNATURE,
  ERROR_NOT_FOUND,
  ERROR_NOT_LSP0,
  FILE_TYPE_NOT_SUPPORTED,
  PUSH_REGISTRY_REQUIRED,
  RESOURCE_EXISTS,
} from '../../lib/utils/error-messages';

/**
 * Handles errors thrown in the application by returning the appropriate error response with the HTTP status code.
 *
 * @param {any} e - The error object thrown.
 * @param {FastifyReply} reply - Fastify reply object used to send the error response.
 */
export function handleError(e: any, reply: FastifyReply) {
  logError(e);
  if (e.code === '23503' && e.detail.includes('present'))
    return reply.code(404).send(error(404, ERROR_NOT_FOUND));
  if (e.code === '23505' && e.detail.includes('exists'))
    return reply.code(409).send(error(409, RESOURCE_EXISTS));

  if (JSON.stringify(e).includes(PUSH_REGISTRY_REQUIRED))
    return reply.code(409).send(error(409, PUSH_REGISTRY_REQUIRED));
  if (JSON.stringify(e).includes(ERROR_NOT_LSP0))
    return reply.code(400).send(error(400, ERROR_NOT_LSP0));
  if (JSON.stringify(e).includes(ERROR_INCORRECT_SIGNED_NONCE))
    return reply.code(403).send(error(403, ERROR_INCORRECT_SIGNED_NONCE));
  if (JSON.stringify(e).includes('Invalid signature'))
    return reply.code(400).send(error(400, ERROR_INVALID_SIGNATURE));
  if (JSON.stringify(e).includes(FILE_TYPE_NOT_SUPPORTED))
    return reply.code(415).send(error(501, FILE_TYPE_NOT_SUPPORTED));
  if (JSON.stringify(e).includes(ERROR_INVALID_PAGE))
    return reply.code(400).send(error(400, ERROR_INVALID_PAGE));
  if (JSON.stringify(e).includes(ERROR_NOT_FOUND))
    return reply.code(404).send(error(404, ERROR_NOT_FOUND));

  return reply.code(500).send(error(500, ERROR_INTERNAL));
}
