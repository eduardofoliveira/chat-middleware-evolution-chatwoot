import type { FastifyReply, FastifyRequest } from "fastify";

const index = async (request: FastifyRequest, reply: FastifyReply) => {
	const { account_id, bot_name } = request.params as {
		account_id: number;
		bot_name: string;
	};
	const body = request.body;

	console.log({
		account_id,
		bot_name,
		body,
	});

	return reply.send({
		message: `Bot flow endpoint hit for account ${account_id} and bot ${bot_name}`,
	});
};

export default {
	index,
};
