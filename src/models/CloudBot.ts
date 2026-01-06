import Db from "../database/connectionManager.js";

type ICloudBot = {
	id: number;
	account_id: number;
	bot_name: string;
	bot_token: string;
};

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export default class CloudBot {
	static tableName = "cloud_v2_bot";

	public static async getByBotName({
		account_id,
		bot_name,
	}: {
		account_id: number;
		bot_name: string;
	}): Promise<ICloudBot> {
		const db = Db.getConnection();
		return db(CloudBot.tableName).where({ account_id, bot_name }).first();
	}

	public static async getById({
		id,
	}: {
		id: number;
	}): Promise<ICloudBot> {
		const db = Db.getConnection();
		return db(CloudBot.tableName).where({ id }).first();
	}
}