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

	const { data } = await axios.get(
		`https://${jira.domain_url}.atlassian.net/rest/api/3/user/search`,
		{
			params: {
				query: encodeURIComponent(email),
			},
			auth: {
				username: jira.email,
				password: jira.token,
			},
		},
	);

	if (data.length > 0) {
		return data[0].accountId;
	} else {
		return null;
	}
};

export default execute;
