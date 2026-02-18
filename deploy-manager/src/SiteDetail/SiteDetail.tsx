import { useState, useEffect, useCallback } from 'react'
import { Link, useParams, useLocation } from 'react-router-dom'
import type { Site, SiteInfo, Deploy, DeployActionType, DeploysGetResponse, ActionLabel, ConfirmState, ApiError } from '../types'
import styles from './SiteDetail.module.css'

const ACTION_LABELS: Record<DeployActionType, ActionLabel> = {
  publish: {
    title: 'Publish this deploy?',
    description: 'This will make the selected deploy the live production version of your site.',
    confirm: 'Publish',
  },
  lock: {
    title: 'Lock publishing?',
    description: 'This will pin the current deploy and prevent any new deploys from being auto-published.',
    confirm: 'Lock',
  },
  unlock: {
    title: 'Unlock publishing?',
    description: 'This will allow new deploys to be auto-published again.',
    confirm: 'Unlock',
  },
}

const SiteDetail = (): React.JSX.Element => {
  const { teamSlug, siteId } = useParams<{ teamSlug: string; siteId: string }>()
  const location = useLocation()
  const passedSite = (location.state as { site?: Site } | null)?.site

  const [site, setSite] = useState<SiteInfo | null>(
    passedSite
      ? {
          id: passedSite.id,
          name: passedSite.name,
          url: passedSite.url,
          custom_domain: passedSite.custom_domain,
          default_domain: passedSite.default_domain,
          published_deploy_id: passedSite.published_deploy?.id,
          deploy_locked: passedSite.published_deploy?.locked ?? false,
        }
      : null
  )
  const [deploys, setDeploys] = useState<Deploy[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [acting, setActing] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [confirm, setConfirm] = useState<ConfirmState | null>(null)

  const fetchData = useCallback((): void => {
    setLoading(true)
    setError(null)
    fetch(`/api/deploys?site_id=${siteId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load deploys (HTTP ${res.status})`)
        return res.json() as Promise<DeploysGetResponse>
      })
      .then((data) => {
        if (data.site) setSite(data.site)
        setDeploys(data.deploys)
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [siteId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const requestAction = (action: DeployActionType, deployId: string): void => {
    setActionError(null)
    setConfirm({ action, deployId })
  }

  const executeAction = async (): Promise<void> => {
    if (!confirm) return
    const { action, deployId } = confirm
    setConfirm(null)
    setActionError(null)
    setActing(`${action}-${deployId}`)
    try {
      const res = await fetch('/api/deploy-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          site_id: siteId,
          deploy_id: deployId,
        }),
      })
      if (!res.ok) {
        const data = (await res.json()) as ApiError
        throw new Error(data.error || `HTTP ${res.status}`)
      }
      fetchData()
    } catch (err) {
      setActionError(`Failed to ${action}: ${(err as Error).message}`)
    } finally {
      setActing(null)
    }
  }

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleString()
  }

  const formatDuration = (seconds: number | null): string => {
    if (!seconds) return '\u2014'
    if (seconds < 60) return `${seconds}s`
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
  }

  const publishedId = site?.published_deploy_id
  const locked = site?.deploy_locked ?? false
  const confirmLabels = confirm ? ACTION_LABELS[confirm.action] : null

  return (
    <div>
      <div className={styles.topBar}>
        <Link to={`/team/${teamSlug}`} className={styles.back}>
          &larr; Sites
        </Link>
        <div className={styles.actions}>
          {locked ? (
            <button
              className={`${styles.btn} ${styles.btnUnlock}`}
              disabled={!!acting}
              onClick={() => requestAction('unlock', publishedId!)}
            >
              {acting === `unlock-${publishedId}` ? 'Unlocking...' : 'Unlock deploys'}
            </button>
          ) : (
            publishedId && (
              <button
                className={`${styles.btn} ${styles.btnLock}`}
                disabled={!!acting}
                onClick={() => requestAction('lock', publishedId)}
              >
                {acting === `lock-${publishedId}` ? 'Locking...' : 'Lock deploys'}
              </button>
            )
          )}
        </div>
      </div>

      <div className={styles.siteHeader}>
        <h1 className={styles.siteName}>{site?.name || siteId}</h1>
        {site?.url && (
          <a
            href={site.url}
            className={styles.siteUrl}
            target="_blank"
            rel="noreferrer"
          >
            {site.custom_domain || site.default_domain}
          </a>
        )}
        {locked && <span className={styles.lockedBadge}>Locked</span>}
      </div>

      {actionError && (
        <div className={styles.actionError}>
          <span>{actionError}</span>
          <button
            className={styles.actionErrorDismiss}
            onClick={() => setActionError(null)}
            aria-label="Dismiss"
          >
            &times;
          </button>
        </div>
      )}

      <h2 className={styles.sectionTitle}>Production deploys</h2>

      {loading && <p className={styles.status}>Loading deploys...</p>}
      {error && (
        <div className={styles.errorBox}>
          <p className={styles.errorMessage}>{error}</p>
          <button className={styles.retryBtn} onClick={fetchData}>Retry</button>
        </div>
      )}
      {!loading && !error && deploys.length === 0 && (
        <p className={styles.status}>No production deploys found.</p>
      )}

      {!loading && !error && deploys.length > 0 && (
        <div className={styles.list}>
          {deploys.map((deploy) => {
            const isPublished = deploy.id === publishedId
            const actionKey = `publish-${deploy.id}`
            return (
              <div
                key={deploy.id}
                className={`${styles.row} ${isPublished ? styles.rowActive : ''}`}
              >
                <div className={styles.rowMain}>
                  <div className={styles.rowHeader}>
                    <span className={styles.deployTitle}>
                      {deploy.title ||
                        (deploy.commit_ref
                          ? deploy.commit_ref.slice(0, 7)
                          : deploy.id.slice(0, 8))}
                    </span>
                    <span className={`${styles.badge} ${styles[`badge_${deploy.state}`]}`}>
                      {deploy.state}
                    </span>
                    {isPublished && (
                      <span className={styles.publishedBadge}>Published</span>
                    )}
                  </div>
                  <div className={styles.rowMeta}>
                    {deploy.branch && (
                      <span className={styles.branch}>{deploy.branch}</span>
                    )}
                    {deploy.commit_ref && (
                      <span className={styles.commit}>
                        {deploy.commit_url ? (
                          <a
                            href={deploy.commit_url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {deploy.commit_ref.slice(0, 7)}
                          </a>
                        ) : (
                          deploy.commit_ref.slice(0, 7)
                        )}
                      </span>
                    )}
                    <span>{formatDate(deploy.created_at)}</span>
                    <span>Deploy time: {formatDuration(deploy.deploy_time)}</span>
                  </div>
                </div>
                <div className={styles.rowActions}>
                  {!isPublished && deploy.state === 'ready' && (
                    <button
                      className={`${styles.btn} ${styles.btnPublish}`}
                      disabled={!!acting}
                      onClick={() => requestAction('publish', deploy.id)}
                    >
                      {acting === actionKey ? 'Publishing...' : 'Publish'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {confirm && confirmLabels && (
        <div className={styles.overlay} onClick={() => setConfirm(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>{confirmLabels.title}</h3>
            <p className={styles.modalDesc}>{confirmLabels.description}</p>
            <div className={styles.modalActions}>
              <button
                className={`${styles.btn} ${styles.btnCancel}`}
                onClick={() => setConfirm(null)}
              >
                Cancel
              </button>
              <button
                className={`${styles.btn} ${styles[`btn${confirm.action.charAt(0).toUpperCase()}${confirm.action.slice(1)}`]}`}
                onClick={executeAction}
              >
                {confirmLabels.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SiteDetail
