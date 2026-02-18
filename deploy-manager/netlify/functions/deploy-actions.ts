import type { Config, Context } from '@netlify/functions'
import type { DeployActionType } from '../../src/types'

const NETLIFY_API = 'https://api.netlify.com/api/v1'

const isValidAction = (action: string): action is DeployActionType =>
  action === 'publish' || action === 'lock' || action === 'unlock'

export default async (request: Request, _context: Context): Promise<Response> => {
  const token = process.env.NETLIFY_ACCESS_TOKEN
  if (!token) {
    return new Response(
      JSON.stringify({ error: 'NETLIFY_ACCESS_TOKEN not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }

  const authHeaders = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }

  const body = (await request.json()) as { action: string; site_id: string; deploy_id: string }
  const { action, site_id, deploy_id } = body

  if (!isValidAction(action)) {
    return Response.json({ error: 'Invalid action' }, { status: 400 })
  }

  let url: string
  if (action === 'publish') {
    if (!site_id || !deploy_id) {
      return Response.json(
        { error: 'site_id and deploy_id are required' },
        { status: 400 },
      )
    }
    url = `${NETLIFY_API}/sites/${site_id}/deploys/${deploy_id}/restore`
  } else if (action === 'lock') {
    if (!deploy_id) {
      return Response.json(
        { error: 'deploy_id is required' },
        { status: 400 },
      )
    }
    url = `${NETLIFY_API}/deploys/${deploy_id}/lock`
  } else {
    if (!deploy_id) {
      return Response.json(
        { error: 'deploy_id is required' },
        { status: 400 },
      )
    }
    url = `${NETLIFY_API}/deploys/${deploy_id}/unlock`
  }

  const res = await fetch(url, { method: 'POST', headers: authHeaders })

  if (!res.ok) {
    const errorText = await res.text()
    return Response.json(
      { error: `Failed to ${action}`, details: errorText },
      { status: res.status },
    )
  }

  const data = (await res.json()) as Record<string, unknown>
  return Response.json(data)
}

export const config: Config = {
  path: '/api/deploy-actions',
  method: ['POST'],
}
