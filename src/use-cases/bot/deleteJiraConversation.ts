import CloudJiraConversation from "../../models/CloudJiraConversation.js";

const execute = async ({ conversation_id }: { conversation_id: number }) => {
	const deletedCount = await CloudJiraConversation.delete({
		conversation_id,
	});

	return deletedCount;
};

export default execute;
