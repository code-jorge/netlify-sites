// --- Netlify API raw response shapes (fields we use) ---

export interface NetlifyApiAccount {
  id: string
  name: string
  slug: string
  type_name: string
  team_logo_url?: string
  avatar_url?: string
  logo_url?: string
}

export interface NetlifyApiPublishedDeploy {
  id: string
  locked: boolean
  published_at: string
  title: string | null
}

export interface NetlifyApiSite {
  id: string
  name: string
  url: string
  ssl_url?: string
  admin_url: string
  custom_domain: string | null
  default_domain: string
  screenshot_url: string | null
  has_password: boolean
  sso_login: boolean
  updated_at: string
  created_at: string
  published_deploy: NetlifyApiPublishedDeploy | null
}

export interface NetlifyApiDeploy {
  id: string
  state: string
  branch: string | null
  deploy_time: number | null
  created_at: string
  published_at: string | null
  title: string | null
  commit_ref: string | null
  commit_url: string | null
  context: string
  locked: boolean
}

// --- App-level types (returned by our serverless functions) ---

export interface Team {
  id: string
  name: string
  slug: string
  type: string
  logo_url: string | null
}

export interface SitePublishedDeploy {
  id: string
  locked: boolean
  published_at: string
  title: string | null
}

export interface Site {
  id: string
  name: string
  url: string
  admin_url: string
  custom_domain: string | null
  default_domain: string
  screenshot_url: string | null
  password_protected: boolean
  sso_login: boolean
  updated_at: string
  created_at: string
  is_latest: boolean
  published_deploy: SitePublishedDeploy | null
}

export interface SiteInfo {
  id: string
  name: string
  url: string
  custom_domain: string | null
  default_domain: string
  published_deploy_id: string | undefined
  deploy_locked: boolean
}

export interface Deploy {
  id: string
  state: string
  branch: string | null
  deploy_time: number | null
  created_at: string
  published_at: string | null
  title: string | null
  commit_ref: string | null
  commit_url: string | null
  locked: boolean
}

export type DeployActionType = 'publish' | 'lock' | 'unlock'

export interface DeployAction {
  action: DeployActionType
  site_id: string
  deploy_id: string
}

export interface DeploysGetResponse {
  site: SiteInfo | null
  deploys: Deploy[]
}

export interface ActionLabel {
  title: string
  description: string
  confirm: string
}

export interface ConfirmState {
  action: DeployActionType
  deployId: string
}

export interface ApiError {
  error: string
  details?: string
}

// --- React component props / context ---

export interface TeamAvatarProps {
  team: Team
  size?: number
}

export interface OutletContextType {
  teams: Team[]
  teamsLoading: boolean
  teamsError: string | null
  retryTeams: () => void
  currentSlug: string | undefined
}
