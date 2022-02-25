import { config } from 'dotenv';
config();

import { fastify } from './lib/fastify';

fastify.listen(process.env.PORT ?? 3000).catch(console.error);

