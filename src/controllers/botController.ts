import axios from "axios";
import type { FastifyReply, FastifyRequest } from "fastify";

const TokenBotDataCosmos = "2h9w9JKmSRHL9E9433fLscN6";

const index = async (request: FastifyRequest, reply: FastifyReply) => {
	const { account_id, bot_name } = request.params as {
		account_id: number;
		bot_name: string;
	};
	const body = request.body;
	const {
		content_type,
		content,
		inbox,
		message_type,
		sender,
		event,
		conversation,
	} = body as {
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
			phone_number: string;
		};
		event: string;
		conversation?: {
			messages?: Array<{
				attachments?: Array<{
					data_url: string;
				}>;
			}>;
		};
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

			await axios.post(
				"https://cloudcom-team.atlassian.net/rest/api/3/issue/10000/comment",
				{
					body: {
						version: 1,
						type: "doc",
						content: [
							{
								type: "paragraph",
								content: [
									{ type: "text", text: "Nome: ", marks: [{ type: "strong" }] },
									{ type: "text", text: `${sender.name}\r\n` },
									{
										type: "text",
										text: "Numero: ",
										marks: [{ type: "strong" }],
									},
									{ type: "text", text: `${sender.phone_number}\r\n\r\n` },
									{
										type: "text",
										text: "Mensagem: \r\n",
										marks: [{ type: "strong" }],
									},
									{ type: "text", text: content },
								],
							},
						],
					},
				},
				{
					headers: {
						Authorization:
							"Basic ZWR1YXJkb0BjbG91ZGNvbS5jb20uYnI6QVRBVFQzeEZmR0YwempYSFpMc2l6QlJZYlFCbXoyVF9SREYwNmtfZno2Q3N1T0E2eFpBQllEaC1RYXZzaUlDMk9rbjVHangxZGpZSHJlUUJPUExqUXZ4cUtZMm0yb0U3OUlZLW1zVXZkZ0lfY293TTE0VXZybGJJa0s2bmZnUDA3SnY5NWIyTDVBTEFTWTlPZVhmeVJRdk83Z0hwT1NBaVQtTlpPYmxFV0RScF9TZEoxeGhfVWlnPTg1NUQ5REVC",
					},
				},
			);

			return reply.send({
				message: `Bot flow endpoint hit for account ${account_id} and bot ${bot_name}`,
			});
		}

		if (
			content_type === "text" &&
			!content &&
			conversation?.messages?.[0]?.attachments?.[0]?.data_url
		) {
			console.log("Mensagem de anexo recebida no bot Cosmos:");
			console.log(`Remetente: ${sender.name} (ID: ${sender.id})`);
			console.log(`Anexo: ${conversation.messages[0].attachments[0].data_url}`);

			await axios.post(
				"https://cloudcom-team.atlassian.net/rest/api/3/issue/10000/comment",
				{
					body: {
						version: 1,
						type: "doc",
						content: [
							{
								type: "paragraph",
								content: [
									{ type: "text", text: "Nome: ", marks: [{ type: "strong" }] },
									{ type: "text", text: `${sender.name}\r\n` },
									{
										type: "text",
										text: "Numero: ",
										marks: [{ type: "strong" }],
									},
									{ type: "text", text: `${sender.phone_number}\r\n\r\n` },
									{
										type: "text",
										text: "Mensagem: \r\n",
										marks: [{ type: "strong" }],
									},
									{
										type: "text",
										text: conversation.messages[0].attachments[0].data_url,
									},
								],
							},
						],
					},
				},
				{
					headers: {
						Authorization:
							"Basic ZWR1YXJkb0BjbG91ZGNvbS5jb20uYnI6QVRBVFQzeEZmR0YwempYSFpMc2l6QlJZYlFCbXoyVF9SREYwNmtfZno2Q3N1T0E2eFpBQllEaC1RYXZzaUlDMk9rbjVHangxZGpZSHJlUUJPUExqUXZ4cUtZMm0yb0U3OUlZLW1zVXZkZ0lfY293TTE0VXZybGJJa0s2bmZnUDA3SnY5NWIyTDVBTEFTWTlPZVhmeVJRdk83Z0hwT1NBaVQtTlpPYmxFV0RScF9TZEoxeGhfVWlnPTg1NUQ5REVC",
					},
				},
			);

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

async function jira(req: FastifyRequest, reply: FastifyReply) {
	const { body, query, params, headers } = req;

	console.log(JSON.stringify({ body, query, params, headers }, null, 2));

	return reply.send({ message: "Jira webhook received" });
}

export default {
	index,
	jira,
};
