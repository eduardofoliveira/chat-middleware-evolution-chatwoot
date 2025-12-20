import CloudMessages from "../../models/CloudMessages.js";

const execute = async ({
	fk_id_jira,
	step,
}: {
	fk_id_jira: number;
	step: number;
}) => {
	const message = await CloudMessages.getByJiraIdAndStep({
		fk_id_jira,
		step,
	});
	return message;
};

export default execute;
