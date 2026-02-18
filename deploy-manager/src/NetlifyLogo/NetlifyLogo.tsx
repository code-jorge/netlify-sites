import styles from './NetlifyLogo.module.css'

const NetlifyLogo = (): React.JSX.Element => (
  <svg viewBox="0 0 40 40" className={styles.logoIcon}>
    <path
      d="M20.48 1.6L37.14 19.38c.2.2.2.53 0 .74L20.48 38.4a.52.52 0 01-.76 0L3.06 20.12a.52.52 0 010-.74L19.72 1.6a.52.52 0 01.76 0z"
      fill="#00c7b7"
    />
  </svg>
)

export default NetlifyLogo
