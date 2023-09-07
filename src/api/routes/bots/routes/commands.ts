import { JSONSchemaType } from 'ajv';
import { FastifyInstance, HookHandlerDoneFunction, RouteShorthandOptions } from 'fastify';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';

import { Bot, BotDocument, IBot } from '../../../../models/bot.js';
import { BaseAuthRouteOptions } from '../../../../typings.js';

export const botCommandsRouter = (fastify: FastifyInstance, options: RouteShorthandOptions, done: HookHandlerDoneFunction): void => {
	fastify.post<PostBotRouteOptions>('/', {
		schema: {
			body: POSTBotCommandsRouteBodySchema,
		},
		handler: async (req, res) => {
			const { botId } = req.body;

			const bot = new Bot({ botId });

			if (!bot) {
				res.code(StatusCodes.NOT_FOUND).send({
					error: true,
					message: ReasonPhrases.NOT_FOUND,
					data: null,
				});

				return;
			}

			if (req.headers.authorization !== bot.key) {
				res.code(StatusCodes.UNAUTHORIZED).send({
					error: true,
					message: ReasonPhrases.UNAUTHORIZED,
					data: null,
				});

				return;
			}

			await bot.save();

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

export interface PostBotRouteOptions extends BaseAuthRouteOptions<BotDocument> {
	Body: Pick<IBot, 'botId'>;
}

const POSTBotCommandsRouteBodySchema: JSONSchemaType<PostBotRouteOptions['Body']> = {
	type: 'object',
	properties: {
		botId: { type: 'string' },
	},
	required: ['botId'],
};