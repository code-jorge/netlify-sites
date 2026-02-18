import { useState, useEffect, useCallback } from 'react'
import { Link, useParams, useOutletContext, useNavigate } from 'react-router-dom'
import type { Site, OutletContextType } from '../types'
import styles from './SiteList.module.css'

const SiteList = (): React.JSX.Element | null => {
  const { teamSlug } = useParams<{ teamSlug: string }>()
  const { teams, teamsLoading, teamsError, retryTeams } = useOutletContext<OutletContextType>()
  const navigate = useNavigate()
  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (!teamSlug && !teamsLoading && teams.length > 0) {
      navigate(`/team/${teams[0].slug}`, { replace: true })
    }
  }, [teamSlug, teams, teamsLoading, navigate])

  const fetchSites = useCallback((): void => {
    if (!teamSlug) return
    setLoading(true)
    setError(null)
    fetch(`/api/sites?team_slug=${teamSlug}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load sites (HTTP ${res.status})`)
        return res.json() as Promise<Site[]>
      })
      .then(setSites)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [teamSlug])

  useEffect(() => {
    fetchSites()
    setQuery('')
  }, [fetchSites])

  if (teamsLoading) {
    return <p className={styles.status}>Loading...</p>
  }

  if (teamsError) {
    return (
      <div className={styles.errorBox}>
        <p className={styles.errorMessage}>{teamsError}</p>
        <button className={styles.retryBtn} onClick={retryTeams}>Retry</button>
      </div>
    )
  }

  if (!teamSlug && teams.length === 0) {
    return <p className={styles.status}>No teams found.</p>
  }

  if (!teamSlug) return null

  const currentTeam = teams.find((t) => t.slug === teamSlug)

  const accessLabel = (site: Site): string => {
    if (site.sso_login) return 'SSO'
    if (site.password_protected) return 'Password'
    return 'Public'
  }

  const accessStyle = (site: Site): string => {
    if (site.sso_login) return styles.valueSso
    if (site.password_protected) return styles.valuePassword
    return styles.valuePublic
  }

  const lowerQuery = query.toLowerCase()
  const filtered = sites.filter(
    (site) =>
      site.name.toLowerCase().includes(lowerQuery) ||
      (site.custom_domain || '').toLowerCase().includes(lowerQuery) ||
      (site.default_domain || '').toLowerCase().includes(lowerQuery)
  )

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.heading}>
          {currentTeam?.name || teamSlug}
          <span className={styles.headingSub}>Sites</span>
        </h1>
      </div>

      {!loading && !error && sites.length > 0 && (
        <div className={styles.searchWrap}>
          <svg
            className={styles.searchIcon}
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
          >
            <path
              d="M7.25 12.5a5.25 5.25 0 100-10.5 5.25 5.25 0 000 10.5zM14 14l-3.6-3.6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Search sites..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              className={styles.searchClear}
              onClick={() => setQuery('')}
              aria-label="Clear search"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M10.5 3.5l-7 7M3.5 3.5l7 7"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          )}
        </div>
      )}

      {loading && <p className={styles.status}>Loading sites...</p>}
      {error && (
        <div className={styles.errorBox}>
          <p className={styles.errorMessage}>{error}</p>
          <button className={styles.retryBtn} onClick={fetchSites}>Retry</button>
        </div>
      )}
      {!loading && !error && sites.length === 0 && (
        <p className={styles.status}>No sites found for this team.</p>
      )}
      {!loading && !error && sites.length > 0 && filtered.length === 0 && (
        <p className={styles.status}>No sites matching &quot;{query}&quot;</p>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className={styles.list}>
          {filtered.map((site) => (
            <Link
              key={site.id}
              className={styles.row}
              to={`/team/${teamSlug}/site/${site.id}`}
              state={{ site }}
            >
              <div className={styles.thumbWrap}>
                {site.screenshot_url ? (
                  <img
                    src={site.screenshot_url}
                    alt=""
                    className={styles.thumb}
                    loading="lazy"
                  />
                ) : (
                  <div className={styles.thumbPlaceholder}>
                    <span>{site.name.charAt(0).toUpperCase()}</span>
                  </div>
                )}
              </div>
              <div className={styles.rowContent}>
                <div className={styles.rowTop}>
                  <span className={styles.name}>{site.name}</span>
                  <span className={styles.url}>
                    {site.custom_domain || site.default_domain}
                  </span>
                </div>
                <div className={styles.rowBottom}>
                  <div className={styles.field}>
                    <span className={styles.label}>Deploy</span>
                    {site.is_latest ? (
                      <span className={styles.valueLatest}>Latest</span>
                    ) : (
                      <span className={styles.valueBehind}>Behind</span>
                    )}
                  </div>
                  <div className={styles.field}>
                    <span className={styles.label}>Publishing</span>
                    {site.published_deploy?.locked ? (
                      <span className={styles.valueLocked}>Locked</span>
                    ) : (
                      <span className={styles.valueOpen}>Open</span>
                    )}
                  </div>
                  <div className={styles.field}>
                    <span className={styles.label}>Access</span>
                    <span className={accessStyle(site)}>{accessLabel(site)}</span>
                  </div>
                  <div className={`${styles.field} ${styles.fieldRight}`}>
                    <span className={styles.label}>Updated</span>
                    <span className={styles.valueDate}>
                      {new Date(site.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default SiteList
