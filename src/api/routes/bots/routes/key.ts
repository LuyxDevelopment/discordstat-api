import { FastifyInstance, HookHandlerDoneFunction, RouteShorthandOptions } from 'fastify';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';

import { Bot, BotDocument } from '../../../../models/bot.js';
import { BaseAuthRouteOptions, Params } from '../../../../typings.js';

export const botKeyRouter = (fastify: FastifyInstance, options: RouteShorthandOptions, done: HookHandlerDoneFunction): void => {
	fastify.patch<PatchBotRouteOptions>('/', {
		handler: async (req, res) => {
			const bot = new Bot({ botId: req.params.id });

			if (!bot) {
				res.code(StatusCodes.NOT_FOUND).send({
					error: true,
					message: ReasonPhrases.NOT_FOUND,
					data: null,
				});

				return;
			}


			await bot.generateKey();

			res.code(StatusCodes.OK).send({
				error: false,
				message: ReasonPhrases.OK,
				data: bot,
			});

			return;
		},
	});

	done();
};

export interface PatchBotRouteOptions extends BaseAuthRouteOptions<BotDocument> {
	Params: Params;
}