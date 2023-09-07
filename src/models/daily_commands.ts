import mongoose, { HydratedDocument, Model, model, Schema, Types } from 'mongoose';

export interface ICommand {
	name: string;
	uses: number;
}

export interface IDailyCommands {
	botId: string;
	commands: ICommand[];
	timestamp: number;
}

export interface IDailyCommandsMethods {
	updateCommand(name: string): Promise<void>;
}

export type DailyCommandsDocumentProps = {
	commands: Types.DocumentArray<IDailyCommands['commands'][number]>;
};

export type DailyCommandsDocument = HydratedDocument<IDailyCommands, IDailyCommandsMethods & DailyCommandsDocumentProps>;

// eslint-disable-next-line @typescript-eslint/ban-types
export type DailyCommandsModel = Model<IDailyCommands, {}, IDailyCommandsMethods & DailyCommandsDocumentProps>;

export const dailyCommandsSchema = new Schema<IDailyCommands, DailyCommandsModel, IDailyCommandsMethods>({
	botId: { type: Schema.Types.String, required: true },
	commands: [{
		type: new Schema<IDailyCommands['commands'][number]>({
			name: { type: Schema.Types.String, required: true },
			uses: { type: Schema.Types.Number, default: 0 },
		}),
	}],
	timestamp: { type: Schema.Types.Number, default: Date.now() },
}, {
	methods: {
		async updateCommand(this: DailyCommandsDocument, name): Promise<void> {
			const index = this.commands.findIndex(c => c.name === name);

			if (!index) {
				this.commands.push({ name, uses: 1 });

				return;
			}

			this.commands[index].uses++;

			await this.save();
		},
	},
	collection: 'daily_commands',
});

export const DailyCommands = mongoose.models.DailyCommands as DailyCommandsModel || model<IDailyCommands, DailyCommandsModel>('DailyCommands', dailyCommandsSchema);