import type { Config, Context } from '@netlify/functions'
import type { NetlifyApiDeploy, NetlifyApiSite, Deploy, DeploysGetResponse } from '../../src/types'

const NETLIFY_API = 'https://api.netlify.com/api/v1'

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

  const { searchParams } = new URL(request.url)
  const siteId = searchParams.get('site_id')
  if (!siteId) {
    return Response.json({ error: 'site_id is required' }, { status: 400 })
  }

  const [deploysRes, siteRes] = await Promise.all([
    fetch(`${NETLIFY_API}/sites/${siteId}/deploys?per_page=100`, {
      headers: authHeaders,
    }),
    fetch(`${NETLIFY_API}/sites/${siteId}`, { headers: authHeaders }),
  ])

  if (!deploysRes.ok) {
    return Response.json(
      { error: 'Failed to fetch deploys' },
      { status: deploysRes.status },
    )
  }

  const allDeploys = (await deploysRes.json()) as NetlifyApiDeploy[]
  const siteData = siteRes.ok ? ((await siteRes.json()) as NetlifyApiSite) : null

  const productionDeploys: Deploy[] = allDeploys
    .filter((d) => d.context === 'production')
    .slice(0, 20)
    .map((d) => ({
      id: d.id,
      state: d.state,
      branch: d.branch,
      deploy_time: d.deploy_time,
      created_at: d.created_at,
      published_at: d.published_at,
      title: d.title,
      commit_ref: d.commit_ref,
      commit_url: d.commit_url,
      locked: d.locked,
    }))

  const response: DeploysGetResponse = {
    site: siteData
      ? {
          id: siteData.id,
          name: siteData.name,
          url: siteData.ssl_url || siteData.url,
          custom_domain: siteData.custom_domain,
          default_domain: siteData.default_domain,
          published_deploy_id: siteData.published_deploy?.id,
          deploy_locked: siteData.published_deploy?.locked ?? false,
        }
      : null,
    deploys: productionDeploys,
  }

  return Response.json(response)
}

export const config: Config = {
  path: '/api/deploys',
}
