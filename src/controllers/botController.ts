import type { FastifyReply, FastifyRequest } from "fastify";

const TokenBotDataCosmos = "2h9w9JKmSRHL9E9433fLscN6";

const index = async (request: FastifyRequest, reply: FastifyReply) => {
	const { account_id, bot_name } = request.params as {
		account_id: number;
		bot_name: string;
	};
	const body = request.body;
	const { content_type, content, inbox, message_type, sender, event } =
		body as {
			content_type: string;
			content: string;
			inbox: {
				id: number;
				name: string;
			};
			message_type: string;
			sender: {
				id: number;
				name: string;
			};
			event: string;
		};
	const { id: inboxId, name: inboxName } = inbox;

	if (
		event === "message_created" &&
		message_type === "incoming" &&
		inboxName === "1135880866" &&
		inboxId === 49
	) {
		if (content_type === "text" && content) {
			console.log("Mensagem de texto recebida no bot Cosmos:");
			console.log(`Remetente: ${sender.name} (ID: ${sender.id})`);
			console.log(`Conteúdo: ${content}`);

			return reply.send({
				message: `Bot flow endpoint hit for account ${account_id} and bot ${bot_name}`,
			});
		}
	}

	console.log(
		JSON.stringify(
			{
				account_id,
				bot_name,
				body,
			},
			null,
			2,
		),
	);

	return reply.send({
		message: `Bot flow endpoint hit for account ${account_id} and bot ${bot_name}`,
	});
};

export default {
	index,
};
