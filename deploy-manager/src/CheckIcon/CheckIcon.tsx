import styles from './CheckIcon.module.css'

const CheckIcon = (): React.JSX.Element => (
  <svg
    className={styles.checkIcon}
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
  >
    <path
      d="M3.5 8.5l3 3 6-7"
      stroke="var(--teal)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export default CheckIcon
