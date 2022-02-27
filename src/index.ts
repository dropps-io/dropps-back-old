import path from "path";
import { config } from 'dotenv';

export const NODE_ENV = (process.env.NODE_ENV || 'development') as 'test' | 'development' | 'production'


if (NODE_ENV === 'test') config({ path: path.resolve(process.cwd(), '.env.test') });
if (NODE_ENV === 'production') config({ path: path.resolve(process.cwd(), '.env.prod') });

config();

import { fastify } from './lib/fastify';

fastify.listen(process.env.PORT ?? 3030).catch(console.error);

