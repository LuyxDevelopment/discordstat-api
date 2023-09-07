import mongoose, { HydratedDocument, Model, model, Schema, Types } from 'mongoose';

import { Bot, BotDocument, IBot } from './bot.js';

export interface IUser {
	userId: string;
	bots: Types.ObjectId[];
}

export interface UserMethods {
	addBot(discordId: string): Promise<BotDocument>;
}

export interface PopulatedUser {
	bots: BotDocument[];
}

export type UserDocumentProps = {
	bots: Types.DocumentArray<Types.ObjectId> & IBot;
};

export type UserDocument = HydratedDocument<IUser, UserMethods & UserDocumentProps>;

export type UserPopulatedDocument = Omit<UserDocument, 'bots'> & PopulatedUser;

// eslint-disable-next-line @typescript-eslint/ban-types
export type UserModel = Model<IUser, {}, UserMethods & UserDocumentProps>;

export const userSchema = new Schema<IUser, UserModel, UserMethods>({
	userId: { type: Schema.Types.String, required: true, immutable: true },
	bots: [{ type: Schema.Types.ObjectId, ref: 'Bot' }],
}, {
	methods: {
		async addBot(this: UserDocument, botId: string): Promise<BotDocument> {
			const bot = new Bot({ botId });

			await bot.save();

			return bot;
		}
	},
	collection: 'users',
});

export const User = mongoose.models.User as UserModel || model<IUser, UserModel>('User', userSchema);