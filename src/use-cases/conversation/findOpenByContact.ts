import Conversation from "../../models/Conversation.js"

const execute = async ({ contact_id, account_id, inbox_id }: { contact_id: number, account_id: number, inbox_id: number }) => {
  return Conversation.findByContactId({ contact_id, account_id, inbox_id })
}

export default execute