import axios from "axios";

import Db from "../../database/connectionManager.js";

const execute = async ({
	id_jira,
	email,
	issue,
	message,
	number,
	name,
}: {
	id_jira: number;
	email: string;
	issue: number;
	message: string;
	number: string;
	name: string;
}) => {
	const db = Db.getConnection();
	const jira = await db("cloud_v2_jira").where({ id: id_jira }).first();

	// const commentBody = `Message from ${name} (${number}):\n\n${message}`;

	await axios.post(
		`https://${jira.domain_url}.atlassian.net/rest/api/3/issue/${issue}/comment`,
		{
			body: {
				version: 1,
				type: "doc",
				content: [
					{
						type: "paragraph",
						content: [
							{
								type: "text",
								text: "Nome: ",
								marks: [
									{
										type: "strong",
									},
								],
							},
							{
								type: "text",
								text: `${name}\r\n`,
							},
							{
								type: "text",
								text: "Numero: ",
								marks: [
									{
										type: "strong",
									},
								],
							},
							{
								type: "text",
								text: `${number}\r\n\r\n`,
							},
							{
								type: "text",
								text: "Mensagem: \r\n",
								marks: [
									{
										type: "strong",
									},
								],
							},
							message
								.split("\n")
								.flatMap((line: string, index: number, arr: string[]) => [
									{
										type: "text",
										text: line,
									},
									...(index < arr.length - 1
										? [{ type: "text", text: "\r\n" }]
										: []),
								]),
							//
							// {
							// 	type: "text",
							// 	text: "Olá testando \r\n fdfdf",
							// },
							// {
							// 	type: "text",
							// 	text: "dsiodosid",
							// },
						],
					},
				],
			},
		},
		{
			auth: {
				username: email,
				password: jira.token,
			},
		},
	);
};

export default execute;
