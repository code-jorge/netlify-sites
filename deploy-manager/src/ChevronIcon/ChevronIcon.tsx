import styles from './ChevronIcon.module.css'

const ChevronIcon = ({ open }: { open?: boolean }): React.JSX.Element => (
  <svg
    className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
  >
    <path
      d="M3 4.5l3 3 3-3"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export default ChevronIcon
