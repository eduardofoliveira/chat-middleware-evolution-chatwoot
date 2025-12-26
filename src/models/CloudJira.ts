import Db from "../database/connectionManager.js";

type ICloudBot = {
	id: number;
	domain_url: string;
	token: string;
	fk_id_bot: number;
	email: string;
};

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export default class CloudJira {
	static tableName = "cloud_v2_jira";

	public static async getByBotId({
		bot_id,
	}: {
		bot_id: number;
	}): Promise<ICloudBot> {
		const db = Db.getConnection();
		return db(CloudJira.tableName).where({ fk_id_bot: bot_id }).first();
	}
}
