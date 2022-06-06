import { fastify } from './lib/fastify';
import {HOST} from "./environment/endpoints";
import {logError} from "./bin/logger";

fastify.listen(process.env.PORT ?? 3030, HOST).catch(logError);

// TODO Why not install GRAPHQL
