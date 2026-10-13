import axios from 'axios'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { Session } from 'next-auth'

// Create a base URL that works in Docker container network if running in a container
// or falls back to the public URL if not in a container
const getServerSideBaseUrl = () => {
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'https://textbeeselfhosted.onrender.com/api/v1'
}
export const httpServerClient = axios.create({
  baseURL: getServerSideBaseUrl(),
})

httpServerClient.interceptors.request.use(async (config) => {
  const session: Session | null = await getServerSession(authOptions as any)
  if (session?.user?.accessToken) {
    config.headers.Authorization = `Bearer ${session.user.accessToken}`
  }
  return config
})
