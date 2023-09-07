import { ReasonPhrases } from 'http-status-codes';

import { PopulatedUser } from './models/user.js';

export interface BaseAuthRouteOptions<D = null> {
	Header: {
		Authorization: string;
	};
	Reply: {
		error: boolean;
		message: ReasonPhrases;
		data: D | null;
	};
}

export interface Params {
	id: string;
}

export type UserPopulate = Pick<PopulatedUser, 'bots'>;