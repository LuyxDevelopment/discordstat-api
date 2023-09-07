import { FastifyInstance, HookHandlerDoneFunction, RouteShorthandOptions } from 'fastify';

import { botsRouter } from './routes/bots/index.js';
import { usersRouter } from './routes/users/index.js';

export const mainRouter = (fastify: FastifyInstance, options: RouteShorthandOptions, done: HookHandlerDoneFunction): void => {
	fastify.register(botsRouter, { prefix: '/bots' });
	fastify.register(usersRouter, { prefix: '/users' });

	done();
};