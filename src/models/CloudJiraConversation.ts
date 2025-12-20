import Db from "../database/connectionManager.js";

type ICloudJiraConversation = {
	id: number;
	fk_id_jira: number;
	issue: number;
	conversation_id: number;
	sender_id: number;
	sender_name: string;
	phone_number: string;
	email: string;
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

		// await db(CloudJiraConversation.tableName)
		// 	.where("updated_at", "<", "now() - INTERVAL '24 hours'")
		// 	.del()
		await db.raw(`
      DELETE FROM ${CloudJiraConversation.tableName}
      WHERE updated_at < NOW() - INTERVAL '24 hours';
    `);

		return;
	}
}
