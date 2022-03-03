import path from "path";
import { config } from 'dotenv';

export const NODE_ENV = (process.env.NODE_ENV || 'development') as 'test' | 'development' | 'production';

if (NODE_ENV === 'test') config({ path: path.resolve(process.cwd(), '.env.test') });
if (NODE_ENV === 'production') config({ path: path.resolve(process.cwd(), '.env.prod') });

config();

export const DB_HOST: string = getOrThrow('DB_HOST');
export const DB_NAME: string = getOrThrow('DB_NAME');
export const DB_USER: string = getOrThrow('DB_USER');
export const DB_PASSWORD: string = getOrThrow('DB_PASSWORD');
export const HOST: string = getOrThrow('HOST');
export const JWT_SECRET: string = getOrThrow('JWT_SECRET');

function getOrThrow(name: string) {
	const val = process.env[name];
	if (typeof val === 'undefined') throw new Error(`Missing mandatory environment variable ${name}`);
	return val;
}
