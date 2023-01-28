import path from 'path';
import { config } from 'dotenv';
import {JWK} from "../bin/arweave/types/JWK";

export const NODE_ENV = (process.env.NODE_ENV || 'development') as 'test' | 'development' | 'production' | 'staging';

if (NODE_ENV === 'test') config({ path: path.resolve(process.cwd(), '.env.test') });
if (NODE_ENV === 'production') config({ path: path.resolve(process.cwd(), '.env.prod') });
if (NODE_ENV === 'staging') config({ path: path.resolve(process.cwd(), '.env.staging') });

config();

export const DB_HOST: string = getOrThrow('DB_HOST');
export const DB_PORT: number = parseInt(getOrThrow('DB_PORT'));
export const DB_NAME: string = getOrThrow('DB_NAME');
export const DB_USER: string = getOrThrow('DB_USER');
export const DB_PASSWORD: string = getOrThrow('DB_PASSWORD');
export const HOST: string = getOrThrow('HOST');
export const JWT_SECRET: string = getOrThrow('JWT_SECRET');
export const COOKIE_SECRET: string = getOrThrow('COOKIE_SECRET');
export const ARWEAVE_WALLET: JWK = JSON.parse(getOrThrow('ARWEAVE_WALLET'));

function getOrThrow(name: string) {
	const val = process.env[name];
	if (typeof val === 'undefined') throw new Error(`Missing mandatory environment variable ${name}`);
	return val;
}
