import fastifyFactory from 'fastify'
import {usersController} from "../controllers/usersController";

import * as userSchema from '../models/json/user.json';

export const fastify = fastifyFactory({ logger: false })
  .addSchema(userSchema)
  .register(usersController, { prefix: '/users/' })

