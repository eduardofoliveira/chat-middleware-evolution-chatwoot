import CloudJiraConversation from "../../models/CloudJiraConversation.js";

const execute = async ({
	id,
	step,
	fk_id_jira,
	conversation_id,
	sender_id,
	sender_name,
	phone_number,
	email,
	issue,
}: {
	id: number;
	step: number;
	fk_id_jira: number;
	conversation_id: number;
	sender_id: number;
	sender_name: string;
	phone_number: string;
	email: string | null;
	issue: number | null;
}) => {
	const conversation = await CloudJiraConversation.update({
		id,
		step,
		fk_id_jira,
		conversation_id,
		sender_id,
		sender_name,
		phone_number,
		email,
		issue,
	});
	return conversation;
};

export default execute;
