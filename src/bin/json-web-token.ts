import * as jwt from 'jsonwebtoken';
import {JWT_SECRET} from '../environment/endpoints';
import {FastifyReply, FastifyRequest} from 'fastify';
import {error, ERROR_UNAUTHORIZED} from './utils/error-messages';
import {JWT_VALIDITY_TIME} from '../environment/config';

export interface JWTPayload {
  address: string,
  iat: number,
  exp: number
}

export function generateJWT(address: string): string {
	return jwt.sign({
		address: address
	}, JWT_SECRET, {expiresIn: JWT_VALIDITY_TIME + 'h'});
}

export async function verifyJWT(req: FastifyRequest, res: FastifyReply, userAddress: string) {
	const payload = await (req as any).jwtVerify();
	if (userAddress !== (payload as any).address) return res.code(403).send(error(403, ERROR_UNAUTHORIZED));
}
