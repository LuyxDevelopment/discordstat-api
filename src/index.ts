import { fastify } from 'fastify';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';

import { mainRouter } from './api/index.js';
import { BaseAuthRouteOptions } from './typings.js';

mongoose.connect(process.env.MONGO_URI, { dbName: 'DiscordStat' }).then(() => {
	console.info('Connected to Mongo');
}).catch((err) => {
	console.error(`Couldn't connect to Mongo.\nError: ${err.message}`);
});

const server = fastify({
	logger: true,
});

server.setNotFoundHandler<BaseAuthRouteOptions>((req, res) => {
	res.code(StatusCodes.NOT_FOUND).send({
		error: true,
		message: ReasonPhrases.NOT_FOUND,
		data: null,
	});

	return;
});

server.setErrorHandler((err, req, res) => {
	res.code(StatusCodes.INTERNAL_SERVER_ERROR).send({
		error: true,
		message: ReasonPhrases.INTERNAL_SERVER_ERROR,
		data: err.message,
	});

	console.error(err);

	return;
});

server.register(mainRouter);

server.listen({ host: '127.0.0.1', port: 3000 });