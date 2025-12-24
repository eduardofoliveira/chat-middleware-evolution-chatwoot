import axios from "axios";

import Db from "../../database/connectionManager.js";

const execute = async ({
	id_jira,
	email,
}: {
	id_jira: number;
	email: string;
}) => {
	const db = Db.getConnection();
	const jira = await db("cloud_v2_jira").where({ id: id_jira }).first();

	const jql = `creator = "${email}" ORDER BY created DESC`;

	const { data } = await axios.get(
		`https://${jira.domain_url}.atlassian.net/rest/api/3/search/jql`,
		{
			params: {
				jql,
				fields: "key,summary,status,priority,created,creator",
				maxResults: 20,
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

	return {
		textWhatsapp,
		relacaoTickets,
	};
};

export default execute;
