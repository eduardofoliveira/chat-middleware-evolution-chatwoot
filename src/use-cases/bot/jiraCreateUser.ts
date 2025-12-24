import axios from "axios";

import Db from "../../database/connectionManager.js";

const execute = async ({
	id_jira,
	email,
	name,
}: {
	id_jira: number;
	email: string;
	name: string;
}) => {
	const db = Db.getConnection();
	const jira = await db("cloud_v2_jira").where({ id: id_jira }).first();

	await axios.post(
		`https://${jira.domain_url}.atlassian.net/rest/api/3/user`,
		{
			emailAddress: email,
			displayName: name,
			notification: "false",
			products: ["jira-software"],
		},
		{
			auth: {
				username: jira.email,
				password: jira.token,
			},
		},
	);
};

export default execute;
