import Contact from "../../models/Contact.js"

const execute = async ({ identifier, account_id }: { identifier: string, account_id: number }) => {
  return Contact.getByIdentifier({ identifier, account_id })
}

export default execute