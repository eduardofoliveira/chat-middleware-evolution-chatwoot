import "dotenv/config";
import axios from "axios";

import Db from "./database/connectionManager.js";

// const obterAccountId = async ({ email }: { email: string }) => {
// 	const db = Db.getConnection();
// 	const jira = await db("cloud_v2_jira").where({ id: 1 }).first();

// 	const { data } = await axios.get(
// 		`https://cloudcom-team.atlassian.net/rest/api/3/user/search`,
// 		{
// 			params: {
// 				query: encodeURIComponent(email),
// 			},
// 			auth: {
// 				username: jira.email,
// 				password: jira.token,
// 			},
// 		},
// 	);

// 	return data[0].accountId;
// };

const listarChamados = async ({ email }: { email: string }) => {
	const db = Db.getConnection();
	const jira = await db("cloud_v2_jira").where({ id: 1 }).first();

	// const accountId = await obterAccountId({ email: "eduardo@cloudcom.com.br" });

	const jql = `creator = "${email}" ORDER BY created ASC`;

	// console.log(jql);

	const { data } = await axios.get(
		`https://${jira.domain_url}.atlassian.net/rest/api/3/search/jql`,
		{
			params: {
				jql,
				fields: "key,summary,status,priority,created,creator",
				maxResults: 10,
			},
			auth: {
				username: jira.email,
				password: jira.token,
			},
		},
	);

	const relacaoTickets: Record<number, string> = {};
	const textWhatsapp = data.issues
		.map((issue: any, index: number) => {
			relacaoTickets[index + 1] = issue.id;
			return `${index + 1}.\n*ID:* ${issue.id}\n*Ticket:* - ${issue.fields.summary}\nStatus: ${issue.fields.status.name}\nPriority: ${issue.fields.priority ? issue.fields.priority.name : "N/A"}\nCreated: ${new Date(issue.fields.created).toLocaleString()}\n`;
		})
		.join("\n");

	// console.log(data);
	// console.log(textWhatsapp);
	// console.log(relacaoTickets);

	return {
		textWhatsapp,
		relacaoTickets,
	};
};

const createIssue = async ({
	email,
	summary,
	description,
}: {
	email: string;
	summary: string;
	description: string;
}) => {
	const db = Db.getConnection();
	const jira = await db("cloud_v2_jira").where({ id: 1 }).first();

	const issueData = {
		fields: {
			project: {
				key: "KAN",
			},
			summary,
			description: {
				content: [
					{
						content: [
							{
								text: "Order entry fails when selecting supplier.",
								type: "text",
							},
						],
						type: "paragraph",
					},
				],
				type: "doc",
				version: 1,
			},
			issuetype: {
				name: "Task",
			},
			reporter: {
				id: "70121:3e2120df-da90-4624-bf80-98c83d3915a2",
			},
		},
	};

	const { data } = await axios.post(
		`https://${jira.domain_url}.atlassian.net/rest/api/3/issue`,
		issueData,
		{
			auth: {
				username: jira.email,
				password: jira.token,
			},
		},
	);

	return data;
};

const execute = async () => {
	// const result = await listarChamados({ email: "eduardo@cloudcom.com.br" });
	// console.log(result);

	const result = await createIssue({
		email: "eduardo_felipe_oliveira@yahoo.com.br",
		summary: "Teste de criação de chamado via API",
		description: "Descrição do chamado criado via API",
	});

	console.log(result);
};

execute();
