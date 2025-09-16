import Conversation from "../../models/Conversation.js"

const execute = async ({ contact_id, account_id }: { contact_id: number, account_id: number }) => {
  return Conversation.findByContactId({ contact_id, account_id })
}

export default execute