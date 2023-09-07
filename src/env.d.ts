declare global {
	namespace NodeJS {
		interface ProcessEnv {
			CIPHER_KEY: string;
			CIPHER_IV: string;
			MONGO_URI: string;
		}
	}
}

export { };