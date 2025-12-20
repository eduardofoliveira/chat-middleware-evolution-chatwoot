import CloudMessages from "../../models/CloudMessages.js";

const execute = async ({ fk_id_jira }: { fk_id_jira: number }) => {
	const message = await CloudMessages.getFirstMessageByJiraId({ fk_id_jira });
	return message;
};

export default execute;
