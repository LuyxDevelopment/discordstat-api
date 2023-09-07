import { config } from 'dotenv';
import crypto from 'node:crypto';

config();

export class TokenGenerator {
	private static readonly KEY = Buffer.from(process.env.CIPHER_KEY, 'hex');
	private static readonly IV = Buffer.from(process.env.CIPHER_IV, 'hex');
	private static readonly SEPERATOR = ':.:';

	public static generateToken(botId: string): string {
		const r = crypto.randomBytes(8).toString('base64');
		const date = new Date().toISOString();

		return this.encrypt(r + this.SEPERATOR + date + this.SEPERATOR + botId);
	}

	public static decipherToken(token: string): { r: string, date: string, botId: string; } {
		const [r, date, botId] = this.decrypt(token).split(this.SEPERATOR) as [string, string, string];

		return { r, date, botId };
	}

	public static encrypt(data: string): string {
		const cipher = crypto.createCipheriv('aes-256-cbc', this.KEY, this.IV);
		const e = cipher.update(data);

		return Buffer.concat([e, cipher.final()]).toString('base64');
	}

	public static decrypt(data: string): string {
		const decipher = crypto.createDecipheriv('aes-256-cbc', this.KEY, this.IV);
		const d = decipher.update(Buffer.from(data, 'base64'));

		return Buffer.concat([d, decipher.final()]).toString();
	}
}