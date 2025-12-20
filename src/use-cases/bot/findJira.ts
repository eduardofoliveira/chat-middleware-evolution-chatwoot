import CloudJira from "../../models/CloudJira.js";

const execute = async ({ bot_id }: { bot_id: number }) => {
	const jira = await CloudJira.getByBotId({ bot_id });
	return jira;
};

export default execute;
