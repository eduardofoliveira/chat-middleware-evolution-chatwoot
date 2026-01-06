import CloudJiraConversationRelation from "../../models/CloudJiraConversationRelation.js";

const execute = async ({
  conversation_id,
  fk_id_jira,
  issue,
}: {
  conversation_id: number;
  fk_id_jira: number;
  issue: number;
}) => {
  const exists = await CloudJiraConversationRelation.getByConversationId({
    conversation_id,
    fk_id_jira,
  });

  if (exists && exists.conversation_id === conversation_id && exists.fk_id_jira === fk_id_jira && exists.issue === issue) {
    return exists;
  }

  const conversation = await CloudJiraConversationRelation.create({
    conversation_id,
    fk_id_jira,
    issue
  });

  return conversation;
};

export default execute;
