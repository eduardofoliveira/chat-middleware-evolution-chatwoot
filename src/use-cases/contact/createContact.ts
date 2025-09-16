import Contact from "../../models/Contact.js"

const execute = async ({ identifier, account_id, name, phone_number, country_code, custom_attributes, additional_attributes }: {
  identifier: string, account_id: number, name: string, phone_number: string, country_code?: string, custom_attributes?: string, additional_attributes?: string
}) => {
  const id = await Contact.create({
    account_id,
    identifier,
    name,
    phone_number,
    email: "",
    additional_attributes: additional_attributes || "{}",
    custom_attributes: custom_attributes || "{}",
    last_activity_at: new Date(),
    contact_type: 1,
    middle_name: "",
    last_name: "",
    location: "",
    country_code: country_code || "",
    blocked: false,
    created_at: new Date(),
    updated_at: new Date(),
  })

  return id
}

export default execute