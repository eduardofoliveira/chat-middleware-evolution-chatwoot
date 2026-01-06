import CloudJiraConversationRelation from "../../models/CloudJiraConversationRelation.js";

const execute = async ({
  fk_id_jira,
  issue,
}: {
  fk_id_jira: number;
  issue: number;
}) => {
  const exists = await CloudJiraConversationRelation.getByIssue({
    fk_id_jira,
    issue,
  });

  if (exists) {
    return exists;
  }

  return null;
};

export default execute;
