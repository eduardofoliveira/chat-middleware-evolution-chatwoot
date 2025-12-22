import CloudJiraConversation from "../../models/CloudJiraConversation.js";

const execute = async ({ id, step }: { id: number; step: number }) => {
	const conversation = await CloudJiraConversation.updateStep({
		id,
		step,
	});
	return conversation;
};

export default execute;
