import { FastifyInstance, HookHandlerDoneFunction, RouteShorthandOptions } from 'fastify';
import { botCommandsRouter } from './commands.js';
import { botKeyRouter } from './key.js';

export const botRoutesRouter = (fastify: FastifyInstance, options: RouteShorthandOptions, done: HookHandlerDoneFunction): void => {
	fastify.register(botCommandsRouter, { prefix: '/commands' });
	fastify.register(botKeyRouter, { prefix: '/key' });

	done();
};