import CloudJiraConversation from "../../models/CloudJiraConversation.js";

const execute = async ({
	conversation_id,
	fk_id_jira,
}: {
	conversation_id: number;
	fk_id_jira: number;
}) => {
	const conversation = await CloudJiraConversation.getByConversationId({
		conversation_id,
		fk_id_jira,
	});

	return conversation;
};

export default execute;
