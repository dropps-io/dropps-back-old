import fastifyFactory from 'fastify';
import {usersRoute} from './routes/users.route';

import * as userSchema from '../lib/models/json/user.json';
import * as userProfileRelation from '../lib/models/json/user-profile-relation.json';
import {profilesRoute} from "./routes/profiles.route";

export const fastify = fastifyFactory({ logger: false })
	.addSchema(userSchema)
	.addSchema(userProfileRelation)
	.register(usersRoute, { prefix: '/users/' })
	.register(profilesRoute, { prefix: '/profiles/' })

