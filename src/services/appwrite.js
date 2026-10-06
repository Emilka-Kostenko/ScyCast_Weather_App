import { Client, Account, Databases } from 'appwrite'

const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID)

export const account = new Account(client)
export const databases = new Databases(client)

export const DATABASE_ID = '6a96c36e00389f2790f8'
export const USERS_COLLECTION_ID = 'users'
export const LOCATIONS_COLLECTION_ID = 'locations'
