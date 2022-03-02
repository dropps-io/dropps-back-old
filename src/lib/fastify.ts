import fastifyFactory from 'fastify';
import fastifySwagger from "fastify-swagger";

import {usersRoute} from './routes/users.route';
import {profilesRoute} from "./routes/profiles.route";

import * as userSchema from '../lib/models/json/user.json';
import * as userProfileRelation from '../lib/models/json/user-profile-relation.json';


export const fastify = fastifyFactory({logger: true})
	.register(require('fastify-cors'), (instance) => {

		return (req: { headers: { origin: any; }; }, callback: (arg0: null, arg1: { origin: boolean; }) => void) => {
			let corsOptions;
			const origin = req.headers.origin
			// do not include CORS headers for requests from localhost
			const hostname = new URL(origin).hostname
			if(hostname === "localhost"){
				corsOptions = { origin: false }
			} else {
				corsOptions = { origin: true }
			}
			callback(null, corsOptions) // callback expects two parameters: error and options
		}
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

