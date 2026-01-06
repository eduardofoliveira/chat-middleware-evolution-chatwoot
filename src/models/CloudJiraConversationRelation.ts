import Db from "../database/connectionManager.js";

type ICloudJiraConversationRelation = {
  id: number;
  fk_id_jira: number;
  issue: number;
  conversation_id: number;
  enable: boolean;
  created_at: Date;
  updated_at: Date;
};

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export default class CloudJiraConversationRelation {
  static tableName = "cloud_v2_jira_conversation_relation";

  public static async getByConversationId({
    conversation_id,
    fk_id_jira,
  }: {
    conversation_id: number;
    fk_id_jira: number;
  }): Promise<ICloudJiraConversationRelation> {
    const db = Db.getConnection();
    return db(CloudJiraConversationRelation.tableName)
      .where({ conversation_id, fk_id_jira })
      .first();
  }

  public static async getByIssue({
    issue,
    fk_id_jira,
  }: {
    issue: number;
    fk_id_jira: number;
  }): Promise<ICloudJiraConversationRelation> {
    const db = Db.getConnection();
    return db(CloudJiraConversationRelation.tableName)
      .where({ issue, fk_id_jira })
      .first();
  }

  public static async deleteByConversationId({
    conversation_id,
    fk_id_jira,
  }: {
    conversation_id: number;
    fk_id_jira: number;
  }): Promise<number> {
    const db = Db.getConnection();
    const deletedCount = await db(CloudJiraConversationRelation.tableName)
      .where({ conversation_id, fk_id_jira })
      .del();
    return deletedCount;
  }

  public static async deleteByIssue({
    issue,
    fk_id_jira
  }: {
    issue: number;
    fk_id_jira: number;
  }): Promise<number> {
    const db = Db.getConnection();
    const deletedCount = await db(CloudJiraConversationRelation.tableName)
      .where({ issue, fk_id_jira })
      .del();
    return deletedCount;
  }

  public static async create({
    fk_id_jira,
    issue,
    conversation_id,
  }: {
    fk_id_jira: number;
    issue: number;
    conversation_id: number;
  }): Promise<ICloudJiraConversationRelation> {
    const db = Db.getConnection();
    const [newRecord] = await db(CloudJiraConversationRelation.tableName)
      .insert({
        fk_id_jira,
        issue,
        conversation_id,
        enable: true,
        created_at: db.fn.now(),
        updated_at: db.fn.now(),
      })
      .returning("*");
    return newRecord;
  }

  public static async disableByIssue({
    issue,
    fk_id_jira,
  }: {
    issue: number;
    fk_id_jira: number;
  }): Promise<number> {
    const db = Db.getConnection();
    const updatedCount = await db(CloudJiraConversationRelation.tableName)
      .where({ issue, fk_id_jira })
      .update({ enable: false, updated_at: db.fn.now() });
    return updatedCount;
  }

  public static async disableByConversationId({
    conversation_id,
    fk_id_jira,
  }: {
    conversation_id: number;
    fk_id_jira: number;
  }): Promise<number> {
    const db = Db.getConnection();
    const updatedCount = await db(CloudJiraConversationRelation.tableName)
      .where({ conversation_id, fk_id_jira })
      .update({ enable: false, updated_at: db.fn.now() });
    return updatedCount;
  }
}