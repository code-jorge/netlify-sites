import type { TeamAvatarProps } from '../types'
import styles from './TeamAvatar.module.css'

const AVATAR_COLORS = [
  '#6366f1', '#0ea5e9', '#14b8a6', '#f59e0b',
  '#ef4444', '#8b5cf6', '#ec4899', '#10b981',
]

const hashString = (str: string): number => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash)
}

const TeamAvatar = ({ team, size = 28 }: TeamAvatarProps): React.JSX.Element => {
  if (team.logo_url) {
    return (
      <img
        src={team.logo_url}
        alt=""
        className={styles.avatar}
        style={{ width: size, height: size }}
      />
    )
  }

  const color = AVATAR_COLORS[hashString(team.slug) % AVATAR_COLORS.length]
  const initials = team.name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

  return (
    <span
      className={styles.avatarFallback}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.42,
        backgroundColor: color,
      }}
    >
      {initials}
    </span>
  )
}

export default TeamAvatar
