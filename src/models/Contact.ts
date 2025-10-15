import Db from "../database/connectionManager.js";

export type IContact = {
	id: number;
	name: string;
	email: string | null;
	phone_number: string;
	account_id: number;
	created_at: Date;
	updated_at: Date;
	additional_attributes: string;
	identifier: string;
	custom_attributes: string;
	last_activity_at: Date;
	contact_type: number;
	middle_name: string;
	last_name: string;
	location: string;
	country_code: string;
	blocked: boolean;
};

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export default class Contact {
	static tableName = "contacts";

	public static async getAll({
		account_id,
	}: {
		account_id: number;
	}): Promise<IContact[]> {
		const db = Db.getConnection();
		return db(Contact.tableName)
			.select("*")
			.where({ account_id })
			.orderBy("id", "desc");
	}

	public static async getById(id: number): Promise<IContact> {
		const db = Db.getConnection();
		return db(Contact.tableName).where({ id }).first();
	}

	public static async getByIdentifier({
		identifier,
		account_id,
	}: {
		identifier: string;
		account_id: number;
	}): Promise<IContact> {
		const db = Db.getConnection();
		return db(Contact.tableName).where({ identifier, account_id }).first();
	}

	public static async getByPhoneNumber({
		phone_number,
		account_id,
	}: {
		phone_number: string;
		account_id: number;
	}): Promise<IContact> {
		const db = Db.getConnection();
		return db(Contact.tableName).where({ phone_number, account_id }).first();
	}

	public static async create(
		contact: Omit<IContact, "id">,
	): Promise<number | undefined> {
		const db = Db.getConnection();
		const [id] = await db(Contact.tableName).insert(contact).returning("id");
		return id;
	}
}
