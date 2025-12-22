import axios from "axios";
import type { FastifyReply, FastifyRequest } from "fastify";

import createJiraConversation from "../use-cases/bot/createJiraConversation.js";
import deleteOldConversations from "../use-cases/bot/deleteOldConversations.js";
import findBot from "../use-cases/bot/findBot.js";
import findJira from "../use-cases/bot/findJira.js";
import getFirstJiraMessage from "../use-cases/bot/getFirstJiraMessage.js";
import getJiraConversation from "../use-cases/bot/getJiraConversation.js";
import getJiraMessage from "../use-cases/bot/getJiraMessage.js";
import updateJiraConversation from "../use-cases/bot/updateJiraConversation.js";
import updateJiraStepConversation from "../use-cases/bot/updateJiraStepConversation.js";

const TokenBotDataCosmos = "2h9w9JKmSRHL9E9433fLscN6";
const CHATWOOT_URL = process.env.CHATWOOT_URL;

const getMatchingKey = (
	response_options: Record<string, unknown>,
	resposta: string,
) => {
	const key = String(resposta);
	return Object.hasOwn(response_options, key) ? key : null;
};

const sendMessageToChatwoot = async ({
	account_id,
	conversation_id,
	content,
	token,
}: {
	account_id: number;
	conversation_id: number;
	content: string;
	token: string;
}) => {
	await axios.post(
		`${CHATWOOT_URL}/api/v1/accounts/${account_id}/conversations/${conversation_id}/messages`,
		{
			content,
			message_type: "outgoing",
		},
		{
			headers: {
				api_access_token: token,
			},
		},
	);
};

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
		conversation: {
			id: number;
			messages?: Array<{
				attachments?: Array<{
					data_url: string;
				}>;
			}>;
		};
	};
	const { id: inboxId, name: inboxName } = inbox;

	if (message_type === "incoming") {
		const botExists = await findBot({ account_id, bot_name });
		if (!botExists) {
			// Encerra fluxo se o bot não for encontrado
			return reply.status(200).send({ message: "Bot not found" });
		}

		const jiraExists = await findJira({ bot_id: botExists.id });
		await deleteOldConversations();

		const conversationJira = await getJiraConversation({
			conversation_id: conversation.id,
			fk_id_jira: jiraExists.id,
		});

		if (!conversationJira) {
			// const firstMessage = await getFirstJiraMessage({
			// 	fk_id_jira: jiraExists.id,
			// });
			const firstMessage = await getJiraMessage({
				step: 6,
				fk_id_jira: jiraExists.id,
			});

			await createJiraConversation({
				conversation_id: conversation.id,
				fk_id_jira: jiraExists.id,
				email: "",
				sender_id: sender.id,
				sender_name: sender.name,
				phone_number: sender.phone_number,
				step: 0,
				issue: 0,
			});

			await sendMessageToChatwoot({
				account_id,
				conversation_id: conversation.id,
				content: firstMessage.message,
				token: botExists.bot_token,
			});
		} else {
			console.log("Existing Conversation:", conversationJira);

			const jiraMessage = await getJiraMessage({
				step: conversationJira.step,
				fk_id_jira: jiraExists.id,
			});

			// Navegação por opções de resposta
			if (jiraMessage && jiraMessage.message_type === 1) {
				const { response_options } = jiraMessage;
				if (response_options) {
					const optionSelected = getMatchingKey(response_options, content);
					if (optionSelected !== null) {
						const nextStep = response_options[optionSelected] as {
							acao: string;
							step?: number;
							titulo?: string;
						};

						if (nextStep.acao === "navegar") {
							const nextJiraMessage = await getJiraMessage({
								step: nextStep.step as number,
								fk_id_jira: jiraExists.id,
							});

							if (nextJiraMessage) {
								await updateJiraStepConversation({
									id: conversationJira.id,
									step: nextStep.step as number,
								});

								await sendMessageToChatwoot({
									account_id,
									conversation_id: conversation.id,
									content: nextJiraMessage.message,
									token: botExists.bot_token,
								});
							}
						}

						if (nextStep.acao === "abrir_chamado") {
							await sendMessageToChatwoot({
								account_id,
								conversation_id: conversation.id,
								content: `-- Abrir chamado selecionado: ${nextStep.titulo} --`,
								token: botExists.bot_token,
							});
						}
					}
				}
			}

			// Entrada de texto email
			if (jiraMessage && jiraMessage.message_type === 2) {
				const inputName = jiraMessage.input_name;
				if (inputName && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputName)) {
					await updateJiraConversation({
						email: content,
						id: conversationJira.id,
						step: conversationJira.step,
						fk_id_jira: jiraExists.id,
						conversation_id: conversation.id,
						sender_id: sender.id,
						sender_name: sender.name,
						phone_number: sender.phone_number,
						issue: conversationJira.issue,
					});

					await updateJiraStepConversation({
						id: conversationJira.id,
						step: jiraMessage.next_step as number,
					});
				} else {
					await sendMessageToChatwoot({
						account_id,
						conversation_id: conversation.id,
						content: `Por favor, insira um endereço de email válido.`,
						token: botExists.bot_token,
					});
				}
			}
		}
	}

	// if (
	// 	event === "message_created" &&
	// 	message_type === "incoming" &&
	// 	inboxName === "1137115006" &&
	// 	inboxId === 41
	// ) {
	// 	if (content_type === "text" && content) {
	// 		console.log("Mensagem de texto recebida no bot Cosmos:");
	// 		console.log(`Remetente: ${sender.name} (ID: ${sender.id})`);
	// 		console.log(`Conteúdo: ${content}`);

	// 		await axios.post(
	// 			"https://cloudcom-team.atlassian.net/rest/api/3/issue/10000/comment",
	// 			{
	// 				body: {
	// 					version: 1,
	// 					type: "doc",
	// 					content: [
	// 						{
	// 							type: "paragraph",
	// 							content: [
	// 								{ type: "text", text: "Nome: ", marks: [{ type: "strong" }] },
	// 								{ type: "text", text: `${sender.name}\r\n` },
	// 								{
	// 									type: "text",
	// 									text: "Numero: ",
	// 									marks: [{ type: "strong" }],
	// 								},
	// 								{ type: "text", text: `${sender.phone_number}\r\n\r\n` },
	// 								{
	// 									type: "text",
	// 									text: "Mensagem: \r\n",
	// 									marks: [{ type: "strong" }],
	// 								},
	// 								{ type: "text", text: content },
	// 							],
	// 						},
	// 					],
	// 				},
	// 			},
	// 			{
	// 				headers: {
	// 					Authorization:
	// 						"Basic ZWR1YXJkb0BjbG91ZGNvbS5jb20uYnI6QVRBVFQzeEZmR0YwempYSFpMc2l6QlJZYlFCbXoyVF9SREYwNmtfZno2Q3N1T0E2eFpBQllEaC1RYXZzaUlDMk9rbjVHangxZGpZSHJlUUJPUExqUXZ4cUtZMm0yb0U3OUlZLW1zVXZkZ0lfY293TTE0VXZybGJJa0s2bmZnUDA3SnY5NWIyTDVBTEFTWTlPZVhmeVJRdk83Z0hwT1NBaVQtTlpPYmxFV0RScF9TZEoxeGhfVWlnPTg1NUQ5REVC",
	// 				},
	// 			},
	// 		);

	// 		return reply.send({
	// 			message: `Bot flow endpoint hit for account ${account_id} and bot ${bot_name}`,
	// 		});
	// 	}

	// 	if (
	// 		content_type === "text" &&
	// 		!content &&
	// 		conversation?.messages?.[0]?.attachments?.[0]?.data_url
	// 	) {
	// 		console.log("Mensagem de anexo recebida no bot Cosmos:");
	// 		console.log(`Remetente: ${sender.name} (ID: ${sender.id})`);
	// 		console.log(`Anexo: ${conversation.messages[0].attachments[0].data_url}`);

	// 		await axios.post(
	// 			"https://cloudcom-team.atlassian.net/rest/api/3/issue/10000/comment",
	// 			{
	// 				body: {
	// 					version: 1,
	// 					type: "doc",
	// 					content: [
	// 						{
	// 							type: "paragraph",
	// 							content: [
	// 								{ type: "text", text: "Nome: ", marks: [{ type: "strong" }] },
	// 								{ type: "text", text: `${sender.name}\r\n` },
	// 								{
	// 									type: "text",
	// 									text: "Numero: ",
	// 									marks: [{ type: "strong" }],
	// 								},
	// 								{ type: "text", text: `${sender.phone_number}\r\n\r\n` },
	// 								{
	// 									type: "text",
	// 									text: "Mensagem: \r\n",
	// 									marks: [{ type: "strong" }],
	// 								},
	// 								{
	// 									type: "text",
	// 									text: conversation.messages[0].attachments[0].data_url,
	// 								},
	// 							],
	// 						},
	// 					],
	// 				},
	// 			},
	// 			{
	// 				headers: {
	// 					Authorization:
	// 						"Basic ZWR1YXJkb0BjbG91ZGNvbS5jb20uYnI6QVRBVFQzeEZmR0YwempYSFpMc2l6QlJZYlFCbXoyVF9SREYwNmtfZno2Q3N1T0E2eFpBQllEaC1RYXZzaUlDMk9rbjVHangxZGpZSHJlUUJPUExqUXZ4cUtZMm0yb0U3OUlZLW1zVXZkZ0lfY293TTE0VXZybGJJa0s2bmZnUDA3SnY5NWIyTDVBTEFTWTlPZVhmeVJRdk83Z0hwT1NBaVQtTlpPYmxFV0RScF9TZEoxeGhfVWlnPTg1NUQ5REVC",
	// 				},
	// 			},
	// 		);

	// 		return reply.send({
	// 			message: `Bot flow endpoint hit for account ${account_id} and bot ${bot_name}`,
	// 		});
	// 	}
	// }

	// console.log(
	// 	JSON.stringify(
	// 		{
	// 			account_id,
	// 			bot_name,
	// 			body,
	// 		},
	// 		null,
	// 		2,
	// 	),
	// );

	return reply.send({
		message: `Bot flow endpoint hit for account ${account_id} and bot ${bot_name}`,
	});
};

async function jira(req: FastifyRequest, reply: FastifyReply) {
	const { body, query, params, headers } = req;
	const { webhookEvent, comment, issue } = body as {
		webhookEvent: string;
		comment: { body: string };
		issue: { id: string };
	};
	const { id: issueId } = issue as { id: string };
	const { body: commentBody } = comment as { body: string };

	const relacao: Record<
		string,
		{ account_id: number; conversation_id: number }
	> = {
		"10000": {
			account_id: 1,
			conversation_id: 2306,
		},
	};

	if (commentBody.includes("Nome:") && commentBody.includes("Numero:")) {
		return reply.send({ message: "Jira webhook received" });
	}

	// console.log({
	// 	webhookEvent,
	// 	relacao,
	// 	issueId,
	// 	encontrado: relacao[issueId],
	// });

	if (webhookEvent === "comment_created" && relacao[issueId]) {
		await axios.post(
			`${CHATWOOT_URL}/api/v1/accounts/${relacao[issueId].account_id}/conversations/${relacao[issueId].conversation_id}/messages`,
			{
				content: commentBody,
				message_type: "outgoing",
			},
			{
				headers: {
					api_access_token: TokenBotDataCosmos,
				},
			},
		);
	}

	// console.log(JSON.stringify({ body, query, params, headers }, null, 2));

	return reply.send({ message: "Jira webhook received" });
}

export default {
	index,
	jira,
};
