import { JSONSchemaType } from 'ajv';
import { FastifyInstance, HookHandlerDoneFunction, RouteShorthandOptions } from 'fastify';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { isValidObjectId } from 'mongoose';

import { IUser, User, UserDocument, UserPopulatedDocument } from '../../../models/user.js';
import { BaseAuthRouteOptions, Params, UserPopulate } from '../../../typings.js';

export const usersRouter = (fastify: FastifyInstance, options: RouteShorthandOptions, done: HookHandlerDoneFunction): void => {
	fastify.get<GetUserRouteOptions>('/', {
		schema: {
			querystring: GETUserQuerystringSchema,
		},
		handler: async (req, res): Promise<void> => {
			if (!Object.keys(req.query).length) {
				res.code(StatusCodes.OK).send({
					error: true,
					message: ReasonPhrases.OK,
					data: null,
				});

				return;
			}

			const users = await User.find({ ...req.query }, {}, { limit: 10 }).populate<UserPopulate>('modifiers');

			if (!users.length) {
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
				data: users,
			});

			return;
		},
	});

	fastify.delete<DeleteUserRouteOptions>('/:id', {
		schema: {
			params: DELETEUserParamsSchema,
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

			const user = await User.findById(id);

			if (!user) {
				res.code(StatusCodes.NOT_FOUND).send({
					error: true,
					message: ReasonPhrases.NOT_FOUND,
					data: null,
				});

				return;
			}

			await User.deleteOne({ id });

			res.code(StatusCodes.OK).send({
				error: false,
				message: ReasonPhrases.OK,
				data: null,
			});

			return;
		},
	});

	fastify.get<GetUserRouteOptions>('/:id', {
		schema: {
			params: GETUserParamsSchema,
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

			const user = await User.findById(id).populate<UserPopulate>('modifiers');

			if (!user) {
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
				data: user,
			});

			return;
		},
	});

	fastify.post<PostUserRouteOptions>('/', {
		schema: {
			body: POSTUserRouteBodySchema,
		},
		handler: async (req, res) => {
			const { userId } = req.body;

			if (await User.findOne({ userId })) {
				res.code(StatusCodes.CONFLICT).send({
					error: true,
					message: ReasonPhrases.CONFLICT,
					data: null,
				});

				return;
			}

			const user = new User({ userId });

			await user.save();

			res.code(StatusCodes.OK).send({
				error: false,
				message: ReasonPhrases.OK,
				data: user,
			});

			return;
		},
	});

	done();
};

export interface DeleteUserRouteOptions extends BaseAuthRouteOptions {
	Params: Params;
}

export interface GetUserRouteOptions extends BaseAuthRouteOptions<UserPopulatedDocument | UserPopulatedDocument[]> {
	Params: Params;
	Querystring: Partial<Pick<IUser, 'userId'>>;
}

export interface PostUserRouteOptions extends BaseAuthRouteOptions<UserDocument> {
	Body: Pick<IUser, 'userId'>;
}

export const DELETEUserParamsSchema: JSONSchemaType<DeleteUserRouteOptions['Params']> = {
	type: 'object',
	properties: {
		id: { type: 'string' },
	},
	required: ['id'],
};

export const GETUserParamsSchema: JSONSchemaType<GetUserRouteOptions['Params']> = {
	type: 'object',
	properties: {
		id: { type: 'string' },
	},
	required: ['id'],
};

export const GETUserQuerystringSchema: JSONSchemaType<GetUserRouteOptions['Querystring']> = {
	type: 'object',
	properties: {
		userId: { type: 'string', nullable: true },
	},
	required: [],
};

export const POSTUserRouteBodySchema: JSONSchemaType<PostUserRouteOptions['Body']> = {
	type: 'object',
	properties: {
		userId: { type: 'string' },
	},
	required: ['userId'],
};