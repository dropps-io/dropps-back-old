import fastifyFactory from 'fastify';
import {usersRoute} from './routes/users.route';

import * as userSchema from '../lib/models/json/user.json';

export const fastify = fastifyFactory({ logger: false })
	.addSchema(userSchema)
	.register(usersRoute, { prefix: '/users/' });

