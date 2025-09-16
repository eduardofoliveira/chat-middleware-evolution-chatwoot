import Db from "../database/connectionManager.js"

export type IConversation = {
  id: number
  account_id: number
  inbox_id: number
  status: number
  assignee_id?: number
  created_at: Date
  updated_at: Date
  contact_id: number
  display_id: string
  contact_last_seen_at?: Date
  contact_first_seen_at?: Date
  additional_attributes: string
  contact_inbox_id?: number
  uuid: string
  identifier: string
  last_activity_at: Date
  team_id?: number
  campaign_id?: number
  snooze_until?: Date
  custom_attributes: string
  assignee_last_seen_at?: Date
  first_replay_created_at?: Date
  priority: number
  sla_policy_id?: number
  waiting_since?: Date
  cached_label_list: string
}

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export default class Conversation {
  static tableName = "conversations"

  public static async getAll({ account_id }: { account_id: number }): Promise<IConversation[]> {
    const db = Db.getConnection()
    return db(Conversation.tableName).select("*").where({ account_id }).orderBy("id", "desc")
  }

  public static async getById(id: number): Promise<IConversation> {
    const db = Db.getConnection()
    return db(Conversation.tableName).where({ id }).first()
  }

  public static async findByContactId({ contact_id, account_id, inbox_id }: { contact_id: number, account_id: number, inbox_id: number }): Promise<IConversation | null> {
    const db = Db.getConnection()
    return db(Conversation.tableName).where({ contact_id, account_id, inbox_id, status: 0 }).orderBy("id", "desc").first()
  }
}