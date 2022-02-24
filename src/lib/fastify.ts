import fastifyFactory from 'fastify'
import {usersController} from "../controllers/usersController";

export const fastify = fastifyFactory({ logger: false })

  .register(usersController, { prefix: '/users/' })

