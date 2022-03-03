import { fastify } from './lib/fastify';
import {HOST} from "./environment/endpoints";

fastify.listen(process.env.PORT ?? 3030, HOST).catch(console.error);

