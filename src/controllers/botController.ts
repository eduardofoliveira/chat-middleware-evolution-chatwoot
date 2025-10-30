import type { FastifyReply, FastifyRequest } from "fastify";

const TokenBotDataCosmos = "2h9w9JKmSRHL9E9433fLscN6";

const index = async (request: FastifyRequest, reply: FastifyReply) => {
	const { account_id, bot_name } = request.params as {
		account_id: number;
		bot_name: string;
	};
	const body = request.body;

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
