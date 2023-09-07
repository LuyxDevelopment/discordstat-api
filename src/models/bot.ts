import mongoose, { HydratedDocument, Model, model, Schema } from 'mongoose';
import { TokenGenerator } from '../token_generator.js';

export interface IBot {
	botId: string;
	ownerId: string;
	timestamp: number;
	key: string;
}

export interface IBotMethods {
	generateKey(): Promise<string>;
}

export type BotDocument = HydratedDocument<IBot, IBotMethods>;

// eslint-disable-next-line @typescript-eslint/ban-types
export type BotModel = Model<IBot, {}, IBotMethods>;

export const botSchema = new Schema<IBot, BotModel, IBotMethods>({
	botId: { type: Schema.Types.String, required: true, immutable: true },
	ownerId: { type: Schema.Types.String, required: true },
	timestamp: { type: Schema.Types.Number, default: Date.now() },
	key: { type: Schema.Types.String, required: true },
}, {
	methods: {
		async generateKey(this: BotDocument): Promise<string> {
			this.key = TokenGenerator.generateToken(this.botId);

			await this.save();

			return this.key;
		},
	},
	collection: 'bots',
});

export const Bot = mongoose.models.Bot as BotModel || model<IBot, BotModel>('Bot', botSchema);