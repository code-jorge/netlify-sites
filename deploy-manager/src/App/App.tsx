import { useState, useEffect, useRef, useCallback } from 'react'
import { Outlet, Link, useNavigate, useMatch } from 'react-router-dom'
import type { Team, OutletContextType } from '../types'
import NetlifyLogo from '../NetlifyLogo/NetlifyLogo'
import TeamAvatar from '../TeamAvatar/TeamAvatar'
import ChevronIcon from '../ChevronIcon/ChevronIcon'
import CheckIcon from '../CheckIcon/CheckIcon'
import styles from './App.module.css'

const App = (): React.JSX.Element => {
  const [teams, setTeams] = useState<Team[]>([])
  const [teamsLoading, setTeamsLoading] = useState(true)
  const [teamsError, setTeamsError] = useState<string | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const teamMatch = useMatch('/team/:teamSlug/*')
  const currentSlug = teamMatch?.params?.teamSlug
  const currentTeam = teams.find((t) => t.slug === currentSlug)

  const fetchTeams = useCallback((): void => {
    setTeamsLoading(true)
    setTeamsError(null)
    fetch('/api/teams')
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load teams (HTTP ${res.status})`)
        return res.json() as Promise<Team[]>
      })
      .then((data) => {
        setTeams(data)
        if (data.length > 0 && !currentSlug) {
          navigate(`/team/${data[0].slug}`, { replace: true })
        }
      })
      .catch((err: Error) => {
        setTeams([])
        setTeamsError(err.message)
      })
      .finally(() => setTeamsLoading(false))
  }, [currentSlug, navigate])

  useEffect(() => {
    fetchTeams()
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent): void => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [dropdownOpen])

  const selectTeam = (slug: string): void => {
    setDropdownOpen(false)
    navigate(`/team/${slug}`)
  }

  const context: OutletContextType = { teams, teamsLoading, teamsError, retryTeams: fetchTeams, currentSlug }

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link to="/" className={styles.logo}>
            <NetlifyLogo />
            Deploy Manager
          </Link>
        </div>
        <div className={styles.headerRight}>
          {!teamsLoading && teams.length > 0 && (
            <div className={styles.dropdown} ref={dropdownRef}>
              <button
                className={styles.trigger}
                onClick={() => setDropdownOpen((o) => !o)}
                aria-expanded={dropdownOpen}
                aria-haspopup="listbox"
              >
                {currentTeam ? (
                  <>
                    <TeamAvatar team={currentTeam} size={24} />
                    <span className={styles.triggerName}>{currentTeam.name}</span>
                  </>
                ) : (
                  <span className={styles.triggerName}>Select a team</span>
                )}
                <ChevronIcon open={dropdownOpen} />
              </button>
              {dropdownOpen && (
                <div className={styles.menu} role="listbox">
                  {teams.map((team) => (
                    <button
                      key={team.id}
                      className={`${styles.menuItem} ${team.slug === currentSlug ? styles.menuItemActive : ''}`}
                      role="option"
                      aria-selected={team.slug === currentSlug}
                      onClick={() => selectTeam(team.slug)}
                    >
                      <TeamAvatar team={team} size={32} />
                      <div className={styles.menuItemText}>
                        <span className={styles.menuItemName}>{team.name}</span>
                        <span className={styles.menuItemType}>{team.type}</span>
                      </div>
                      {team.slug === currentSlug && (
                        <CheckIcon />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </header>
      <main className={styles.main}>
        <Outlet context={context} />
      </main>
    </div>
  )
}

export default App
