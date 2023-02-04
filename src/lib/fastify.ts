import fastifyFactory from 'fastify';
import fastifySwagger from '@fastify/swagger';
import fastifyCors from '@fastify/cors';
import multer from 'fastify-multer';
import cookie from '@fastify/cookie';
import jwt from '@fastify/jwt';

import { authRoute } from './routes/auth.route';
import { LOGGER } from '../environment/config';
import { looksoRoute } from './routes/lookso/lookso.route';
import { COOKIE_SECRET, JWT_SECRET } from '../environment/endpoints';

import type { FastifyCookieOptions } from '@fastify/cookie';

export const fastify = fastifyFactory({ logger: LOGGER });
fastify
  .register(fastifyCors, {
    origin: ['http://localhost:3000', 'https://lookso.io', 'https://staging.lookso.io'],
    credentials: true,
    methods: ['POST', 'GET', 'PUT', 'DELETE'],
  })
  .register(jwt, {
    secret: JWT_SECRET,
    cookie: {
      cookieName: 'token',
      signed: true,
    },
  })
  .register(cookie, {
    secret: COOKIE_SECRET,
    parseOptions: {},
  } as FastifyCookieOptions)
  .register(fastifySwagger, {
    prefix: '/',
    swagger: {
      info: {
        title: 'Dropps Backend',
        description: 'Backend for the dropps ecosystem.',
        version: '1.0.0',
      },
      externalDocs: {
        url: 'https://github.com/dropps-nft/dropps-back',
        description: 'LinkTable to the Github repository',
      },
      host: 'api.dropps.io',
      schemes: ['http'],
      consumes: ['application/json'],
      produces: ['application/json'],
      tags: [
        { name: 'users', description: 'End-points related to users management' },
        { name: 'profiles', description: 'End-points related to profiles management' },
      ],
      securityDefinitions: {
        apiKey: {
          type: 'apiKey',
          name: 'apiKey',
          in: 'header',
        },
      },
    },
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
    uiHooks: {
      onRequest: function (request, reply, next) {
        next();
      },
      preHandler: function (request, reply, next) {
        next();
      },
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
    exposeRoute: true,
  })
  .register(multer.contentParser)
  .register(authRoute, { prefix: '/auth' })
  .register(looksoRoute, { prefix: '/lookso' });
