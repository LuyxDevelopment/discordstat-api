import { JSONSchemaType } from 'ajv';
import { FastifyInstance, HookHandlerDoneFunction, RouteShorthandOptions } from 'fastify';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { isValidObjectId } from 'mongoose';

import { Bot, BotDocument, IBot } from '../../../models/bot.js';
import { BaseAuthRouteOptions, Params } from '../../../typings.js';
import { botRoutesRouter } from './routes/index.js';
import { TokenGenerator } from '../../../token_generator.js';
import { User } from '../../../models/user.js';

export const botsRouter = (fastify: FastifyInstance, options: RouteShorthandOptions, done: HookHandlerDoneFunction): void => {
	fastify.register(botRoutesRouter, { prefix: '/:id' });

	fastify.get<GetBotRouteOptions>('/', {
		schema: {
			querystring: GETBotQuerystringSchema,
		},
		handler: async (req, res): Promise<void> => {
			const bots = await Bot.find({ ...req.query }, {}, { limit: 10 });

			if (!bots.length) {
				res.code(StatusCodes.NOT_FOUND).send({
					error: true,
					message: ReasonPhrases.NOT_FOUND,
					data: null,
				});

				return;
			}

			res.code(StatusCodes.OK).send({
				error: false,
				message: ReasonPhrases.OK,
				data: bots,
			});

			return;
		},
	});

	fastify.delete<DeleteBotRouteOptions>('/:id', {
		schema: {
			params: DELETEBotParamsSchema,
		},
		handler: async (req, res): Promise<void> => {
			const { id } = req.params;

			if (!isValidObjectId(id)) {
				res.code(StatusCodes.BAD_REQUEST).send({
					error: true,
					message: ReasonPhrases.BAD_REQUEST,
					data: null,
				});

				return;
			}

			const bot = await Bot.findById(id);

			if (!bot) {
				res.code(StatusCodes.NOT_FOUND).send({
					error: true,
					message: ReasonPhrases.NOT_FOUND,
					data: null,
				});

				return;
			}

			await Bot.deleteOne({ id });

			res.code(StatusCodes.OK).send({
				error: false,
				message: ReasonPhrases.OK,
				data: null,
			});

			return;
		},
	});

	fastify.get<GetBotRouteOptions>('/:id', {
		schema: {
			params: GETBotParamsSchema,
		},
		handler: async (req, res) => {
			const { id } = req.params;

			if (!isValidObjectId(id)) {
				res.code(StatusCodes.BAD_REQUEST).send({
					error: true,
					message: ReasonPhrases.BAD_REQUEST,
					data: null,
				});

				return;
			}

			const bot = await Bot.findById(id);

			if (!bot) {
				res.code(StatusCodes.NOT_FOUND).send({
					error: true,
					message: ReasonPhrases.NOT_FOUND,
					data: null,
				});

				return;
			}

			res.code(StatusCodes.OK).send({
				error: false,
				message: ReasonPhrases.OK,
				data: bot,
			});

			return;
		},
	});

	fastify.post<PostBotRouteOptions>('/', {
		schema: {
			body: POSTBotRouteBodySchema,
		},
		handler: async (req, res) => {
			const { botId, ownerId } = req.body;

			if (await Bot.findOne({ botId })) {
				res.code(StatusCodes.CONFLICT).send({
					error: true,
					message: ReasonPhrases.CONFLICT,
					data: null,
				});

				return;
			}

			const bot = new Bot({ botId, ownerId, key: TokenGenerator.generateToken(botId) });

			await bot.save();

			const owner = await User.findOne({ userId: ownerId });

			if (owner) {
				owner.bots.push();
			}

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

export interface DeleteBotRouteOptions extends BaseAuthRouteOptions {
	Params: Params;
}

export interface GetBotRouteOptions extends BaseAuthRouteOptions<BotDocument | BotDocument[]> {
	Params: Params;
	Querystring: Partial<Pick<IBot, 'botId'>>;
}

export interface PatchBotRouteOptions extends BaseAuthRouteOptions<BotDocument> {
	Params: Params;
	Body: Pick<IBot, 'key'>;
}

export interface PostBotRouteOptions extends BaseAuthRouteOptions<BotDocument> {
	Body: Pick<IBot, 'botId' | 'ownerId'>;
}

const DELETEBotParamsSchema: JSONSchemaType<DeleteBotRouteOptions['Params']> = {
	type: 'object',
	properties: {
		id: { type: 'string' },
	},
	required: ['id'],
};

const GETBotParamsSchema: JSONSchemaType<GetBotRouteOptions['Params']> = {
	type: 'object',
	properties: {
		id: { type: 'string' },
	},
	required: ['id'],
};

const GETBotQuerystringSchema: JSONSchemaType<GetBotRouteOptions['Querystring']> = {
	type: 'object',
	properties: {
		botId: { type: 'string', nullable: true },
	},
	required: [],
};

const PATCHBotRouteBodySchema: JSONSchemaType<PatchBotRouteOptions['Body']> = {
	type: 'object',
	properties: {
		key: { type: 'string' },
	},
	required: [],
};

const POSTBotRouteBodySchema: JSONSchemaType<PostBotRouteOptions['Body']> = {
	type: 'object',
	properties: {
		botId: { type: 'string' },
		ownerId: { type: 'string' },
	},
	required: ['botId', 'ownerId'],
};