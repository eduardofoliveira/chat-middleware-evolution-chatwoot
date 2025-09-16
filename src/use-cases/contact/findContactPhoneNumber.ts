import Contact from "../../models/Contact.js"

const execute = async ({ phone_number, account_id }: { phone_number: string, account_id: number }) => {
  return Contact.getByPhoneNumber({ phone_number, account_id })
}

export default execute