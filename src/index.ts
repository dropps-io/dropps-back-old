import { fastify } from './lib/fastify';
import {HOST} from './environment/endpoints';
import {logError} from './bin/logger';
import {PORT} from './environment/config';

fastify.listen(PORT ?? 3030, HOST).catch(logError);

// TODO Why not install GRAPHQL
