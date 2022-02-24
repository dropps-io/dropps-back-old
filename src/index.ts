import { config } from 'dotenv';
import { fastify } from './lib/fastify'

config();

fastify.listen(process.env.PORT ?? 3000).catch(console.error);

