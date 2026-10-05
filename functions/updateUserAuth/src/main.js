import { Client, Users } from 'node-appwrite'

export default async ({ req, res, log, error }) => {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY)

  const users = new Users(client)

  let body
  try {
    body = JSON.parse(req.body)
  } catch {
    return res.json({ success: false, message: 'Invalid request body' }, 400)
  }

  const { userId, email, password } = body

  if (!userId) {
    return res.json({ success: false, message: 'userId is required' }, 400)
  }

  try {
    // Update email in Appwrite Auth if provided
    if (email) {
      await users.updateEmail(userId, email)
      log(`Updated email for user ${userId}`)
    }

    // Update password in Appwrite Auth if provided
    if (password) {
      await users.updatePassword(userId, password)
      log(`Updated password for user ${userId}`)
    }

    return res.json({ success: true })
  } catch (err) {
    error(err.message)
    return res.json({ success: false, message: err.message }, 500)
  }
}
