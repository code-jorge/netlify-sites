import type { Config, Context } from '@netlify/functions'
import type { NetlifyApiSite, NetlifyApiDeploy, Site } from '../../src/types'

const NETLIFY_API = 'https://api.netlify.com/api/v1'

export default async (request: Request, _context: Context): Promise<Response> => {
  const token = process.env.NETLIFY_ACCESS_TOKEN
  if (!token) {
    return new Response(
      JSON.stringify({ error: 'NETLIFY_ACCESS_TOKEN not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }

  const headers = { Authorization: `Bearer ${token}` }

  const { searchParams } = new URL(request.url)
  const teamSlug = searchParams.get('team_slug')
  const url = teamSlug
    ? `${NETLIFY_API}/${teamSlug}/sites?per_page=100`
    : `${NETLIFY_API}/sites?per_page=100`

  const res = await fetch(url, { headers })

  if (!res.ok) {
    return new Response(
      JSON.stringify({ error: 'Failed to fetch sites' }),
      { status: res.status, headers: { 'Content-Type': 'application/json' } },
    )
  }

  const sites = (await res.json()) as NetlifyApiSite[]

  const data: Site[] = await Promise.all(
    sites.map(async (site) => {
      let latestSuccessfulId: string | null = null
      try {
        const deploysRes = await fetch(
          `${NETLIFY_API}/sites/${site.id}/deploys?per_page=20`,
          { headers },
        )
        if (deploysRes.ok) {
          const deploys = (await deploysRes.json()) as NetlifyApiDeploy[]
          const latest = deploys.find(
            (d) => d.context === 'production' && d.state === 'ready',
          )
          if (latest) {
            latestSuccessfulId = latest.id
          }
        }
      } catch {
        // If the fetch fails, leave as null
      }

      const publishedId = site.published_deploy?.id ?? null

      return {
        id: site.id,
        name: site.name,
        url: site.ssl_url || site.url,
        admin_url: site.admin_url,
        custom_domain: site.custom_domain,
        default_domain: site.default_domain,
        screenshot_url: site.screenshot_url || null,
        password_protected: !!site.has_password,
        sso_login: !!site.sso_login,
        updated_at: site.updated_at,
        created_at: site.created_at,
        is_latest:
          latestSuccessfulId != null && latestSuccessfulId === publishedId,
        published_deploy: site.published_deploy
          ? {
              id: site.published_deploy.id,
              locked: site.published_deploy.locked,
              published_at: site.published_deploy.published_at,
              title: site.published_deploy.title,
            }
          : null,
      }
    }),
  )

  return Response.json(data)
}

export const config: Config = {
  path: '/api/sites',
}
