import fastifyFactory from 'fastify'
import {rootController} from "../controllers/rootController";

export const fastify = fastifyFactory({ logger: false })

  .register(rootController, { prefix: '/' })

