import Db from "../database/connectionManager.js";

type ICloudMessages = {
	id: number;
	fk_id_jira: number;
	step: number;
	next_step: number | null;
	message_type: string;
	input_name: string | null;
	message: string;
	response_options: Record<string, unknown> | null;
};

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export default class CloudMessages {
	static tableName = "cloud_v2_messages";

	public static async getFirstMessageByJiraId({
		fk_id_jira,
	}: {
		fk_id_jira: number;
	}): Promise<ICloudMessages> {
		const db = Db.getConnection();
		return db(CloudMessages.tableName).where({ fk_id_jira, step: 0 }).first();
	}

	public static async getByJiraIdAndStep({
		fk_id_jira,
		step,
	}: {
		fk_id_jira: number;
		step: number;
	}): Promise<ICloudMessages> {
		const db = Db.getConnection();
		return db(CloudMessages.tableName).where({ fk_id_jira, step }).first();
	}
}
