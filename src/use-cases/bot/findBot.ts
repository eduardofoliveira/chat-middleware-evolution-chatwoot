import Contact from "../../models/CloudBot.js";

const execute = async ({ bot_name }: { bot_name: string }) => {
	const bot = await Contact.getByBotName({ bot_name });
	return bot;
};

export default execute;
