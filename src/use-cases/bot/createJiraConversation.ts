import CloudJiraConversation from "../../models/CloudJiraConversation.js";

const execute = async ({
	conversation_id,
	fk_id_jira,
	email,
	sender_id,
	sender_name,
	phone_number,
	step,
}: {
	conversation_id: number;
	fk_id_jira: number;
	email: string | null;
	sender_id: number;
	sender_name: string;
	phone_number: string;
	step: number;
}) => {
	const conversation = await CloudJiraConversation.create({
		conversation_id,
		fk_id_jira,
		email,
		sender_id,
		sender_name,
		phone_number,
		step,
	});

	return conversation;
};

export default execute;
