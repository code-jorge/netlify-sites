import type { Config, Context } from '@netlify/functions'
import type { NetlifyApiAccount, Team } from '../../src/types'

const NETLIFY_API = 'https://api.netlify.com/api/v1'

export default async (_request: Request, _context: Context): Promise<Response> => {
  const token = process.env.NETLIFY_ACCESS_TOKEN
  if (!token) {
    return new Response(
      JSON.stringify({ error: 'NETLIFY_ACCESS_TOKEN not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }

  const res = await fetch(`${NETLIFY_API}/accounts`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) {
    return new Response(
      JSON.stringify({ error: 'Failed to fetch teams' }),
      { status: res.status, headers: { 'Content-Type': 'application/json' } },
    )
  }

  const accounts = (await res.json()) as NetlifyApiAccount[]

  const data: Team[] = accounts.map((a) => ({
    id: a.id,
    name: a.name,
    slug: a.slug,
    type: a.type_name,
    logo_url: a.team_logo_url || a.avatar_url || a.logo_url || null,
  }))

  return Response.json(data)
}

export const config: Config = {
  path: '/api/teams',
}
