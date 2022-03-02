import path from 'path';
import { config } from 'dotenv';

export const NODE_ENV = (process.env.NODE_ENV || 'development') as 'test' | 'development' | 'production' | 'staging';

if (NODE_ENV === 'test') config({ path: path.resolve(process.cwd(), '.env.test') });
if (NODE_ENV === 'production') config({ path: path.resolve(process.cwd(), '.env.prod') });
if (NODE_ENV === 'development') config({ path: path.resolve(process.cwd(), '.env') });
if (NODE_ENV === 'staging') config({ path: path.resolve(process.cwd(), '.env.staging') });

config();

import { fastify } from './lib/fastify';
import {ENV, HOST} from './environment/endpoints';

console.log(ENV);
fastify.listen(process.env.PORT ?? 3030, HOST).catch(console.error);

