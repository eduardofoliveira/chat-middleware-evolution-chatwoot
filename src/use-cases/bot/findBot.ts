import CloudBot from "../../models/CloudBot.js";

const execute = async ({
	account_id,
	bot_name,
}: {
	account_id: number;
	bot_name: string;
}) => {
	const bot = await CloudBot.getByBotName({ account_id, bot_name });
	return bot;
};

export default execute;
