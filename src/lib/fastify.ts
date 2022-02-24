import fastifyFactory from 'fastify'
import {universalProfilesController} from "../controllers/universalProfilesController";

export const fastify = fastifyFactory({ logger: false })

  .register(universalProfilesController, { prefix: '/universal-profiles' })

