import axios from "axios";

import Db from "../../database/connectionManager.js";

const execute = async ({
  id_jira,
  title,
  content,
  reporter_id,
  project_key = "KAN",
}: {
  id_jira: number;
  title: string;
  content: string;
  reporter_id: string;
  project_key?: string;
}) => {
  const db = Db.getConnection();
  const jira = await db("cloud_v2_jira").where({ id: id_jira }).first();

  const { data } = await axios.post(
    `https://${jira.domain_url}.atlassian.net/rest/api/3/issue`,
    {
      "fields": {
        "project": {
          "key": project_key
        },
        "reporter": {
          "id": reporter_id
        },
        "issuetype": {
          "id": "10006"
        },
        "summary": title,
        "description": {
          "content": [
            {
              "content": [
                {
                  "text": content,
                  "type": "text"
                }
              ],
              "type": "paragraph"
            }
          ],
          "type": "doc",
          "version": 1
        }
      }
    },
    {
      auth: {
        username: jira.email,
        password: jira.token,
      },
    },
  );

  return data;
};

export default execute;
