import CloudJiraConversation from "../../models/CloudJiraConversation.js";

const execute = async () => {
	await CloudJiraConversation.deleteWithUpdatedAtGreaterThan24Hours();
};

export default execute;
