import Db from "../database/connectionManager.js";

type ICloudJiraConversation = {
	id: number;
	fk_id_jira: number;
	issue: number | null;
	conversation_id: number;
	sender_id: number;
	sender_name: string;
	phone_number: string;
	email: string | null;
	step: number;
	created_at: Date;
	updated_at: Date;
};

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export default class CloudJiraConversation {
	static tableName = "cloud_v2_jira_conversation";

	public static async getByConversationId({
		conversation_id,
		fk_id_jira,
	}: {
		conversation_id: number;
		fk_id_jira: number;
	}): Promise<ICloudJiraConversation> {
		const db = Db.getConnection();
		return db(CloudJiraConversation.tableName)
			.where({ conversation_id, fk_id_jira })
			.first();
	}

	public static async deleteWithUpdatedAtGreaterThan24Hours(): Promise<void> {
		const db = Db.getConnection();

		await db.raw(`
      DELETE FROM ${CloudJiraConversation.tableName}
      WHERE updated_at < NOW() - INTERVAL '24 hours';
    `);

		return;
	}

	public static async create({
		fk_id_jira,
		conversation_id,
		sender_id,
		sender_name,
		phone_number,
		email,
		step,
	}: {
		fk_id_jira: number;
		conversation_id: number;
		sender_id: number;
		sender_name: string;
		phone_number: string;
		email: string | null;
		step: number;
	}): Promise<ICloudJiraConversation> {
		const db = Db.getConnection();
		const [newRecord] = await db(CloudJiraConversation.tableName)
			.insert({
				fk_id_jira,
				conversation_id,
				sender_id,
				sender_name,
				phone_number,
				email,
				step,
			})
			.returning("*");
		return newRecord;
	}
}
