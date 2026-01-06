import CloudBot from "../../models/CloudBot.js";

const execute = async ({
	id
}: {
	id: number;
}) => {
	const bot = await CloudBot.getById({ id });
	return bot;
};

export default execute;
