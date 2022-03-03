import fastifyFactory from 'fastify';
import fastifySwagger from "fastify-swagger";

import {usersRoute} from './routes/users.route';
import {profilesRoute} from "./routes/profiles.route";

import * as userSchema from '../lib/models/json/user.json';
import * as userProfileRelation from '../lib/models/json/user-profile-relation.json';
import fastifyCors from "fastify-cors";
import {authRoute} from './routes/auth.route';
import {LOGGER} from "../environment/config";


export const fastify = fastifyFactory({logger: LOGGER})
	fastify.register(fastifyCors, {
		origin: "*",
		methods: ["POST", "GET", "PUT", "DELETE"]
	})
	.register(fastifySwagger, {
	prefix: '/documentation',
	swagger: {
		info: {
			title: 'Dropps Backend',
			description: 'Backend for the dropps ecosystem.',
			version: '1.0.0'
		},
		externalDocs: {
			url: 'https://github.com/dropps-nft/dropps-back',
			description: 'Link to the Github repository'
		},
		host: "api.dropps.io",
		schemes: ['http'],
		consumes: ['application/json'],
		produces: ['application/json'],
		tags: [
			{ name: 'users', description: 'End-points related to users management' },
			{ name: 'profiles', description: 'End-points related to profiles management' }
		],
		securityDefinitions: {
			apiKey: {
				type: 'apiKey',
				name: 'apiKey',
				in: 'header'
			}
		}
	},
	uiConfig: {
		docExpansion: 'list',
		deepLinking: false
	},
	uiHooks: {
		onRequest: function (request, reply, next) { next() },
		preHandler: function (request, reply, next) { next() }
	},
	staticCSP: true,
	transformStaticCSP: (header) => header,
	exposeRoute: true
})
	.addSchema(userSchema)
	.addSchema(userProfileRelation)
	.register(usersRoute, { prefix: '/users' })
	.register(profilesRoute, { prefix: '/profiles' })
	.register(authRoute, { prefix: '/auth' });

