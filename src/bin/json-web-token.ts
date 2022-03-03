import * as jwt from 'jsonwebtoken';
import {JWT_SECRET, JWT_VALIDITY_TIME} from '../environment/endpoints';
import {FastifyReply, FastifyRequest} from 'fastify';
import {error, ERROR_JWT_EXPIRED, ERROR_NO_JWT_TOKEN, ERROR_UNAUTHORIZED} from './utils/error-messages';

interface JWTPayload {
  address: string,
  iat: number,
  exp: number
}

export function generateJWT(address: string): string {
	return jwt.sign({
		address: address
	}, JWT_SECRET, {expiresIn: JWT_VALIDITY_TIME + 'h'});
}

export function verifyJWT(req: FastifyRequest, res: FastifyReply, userAddress: string) {
	if (!req.headers.authorization) return res.code(401).send(error(401, ERROR_NO_JWT_TOKEN));
	const payload: JWTPayload = jwt.verify(req.headers.authorization?.split(' ')[1], JWT_SECRET) as JWTPayload;
	if (userAddress !== payload.address) return res.code(403).send(error(403, ERROR_UNAUTHORIZED));
	if (payload.exp < parseInt((new Date()).getTime().toString().slice(0, 10))) return res.code(401).send(error(401, ERROR_JWT_EXPIRED));
}
