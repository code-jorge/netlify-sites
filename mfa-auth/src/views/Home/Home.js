import { useState } from "react"
import QRCode from "react-qr-code"
import css from './Home.module.css'

const Home = ()=> {
  
  const [secret, setSecret] = useState('')
  const [code, setCode] = useState('')
  const [result, setResult] = useState('')

  const handleClick = (e)=> {
    fetch(`/analysis?code=${code}&secret=${secret}`)
      .then(res => res.text())
      .then(setResult)
  }

  const isAuthOK = result === 'Valid code'
  
  return (
    <div className={css.home}>
      <header className={css.header}>Multifactor Authentication Demo</header>
      <div className={css.steps}>
        <div className={css.step}>
          <h2 className={css.title}>
            <strong>Step 1</strong> - Establish a very secret key
          </h2>
          <p className={css.subtitle}>
            This secret key will be shared between your device and the authentication server. 
            It will be used to generate the 2FA codes.
          </p>
          <form className={css.form}>
            <label className={css.label}>Secret</label>
            <input 
              className={css.input} 
              type="text" 
              value={secret} 
              onChange={(e)=> setSecret(e.target.value)} 
            />
          </form>
        </div>
        <div className={css.separator}>
          <span>↓</span>
        </div>
        <div className={css.step}>
          <h2 className={css.title}>
            <strong>Step 2</strong> - Scan the secret QR
          </h2>
          <p className={css.subtitle}>
            Scan the QR code with your device using an authenticator app, like <strong>Google Authenticator</strong>,{' '}
            <strong>Microsoft Authenticator</strong> or <strong>Authy</strong>. This QR contains the secret key and allows 
            your device to generate the 2FA codes.
          </p>
          <div className={css.qr}>
            {secret ? (
              <QRCode value={`otpauth://totp/2FA%20Jorge?secret=${secret}`} />
            ) : (
              <p className={css.placeholder}>
                Type a secret to generate a valid QR code to scan from your phone
              </p>
            )}
          </div>
        </div>
        <div className={css.separator}>
          <span>↓</span>
        </div>
        <div className={css.step}>
          <h2 className={css.title}>
            <strong>Step 3</strong> - Validate the 2FA code
          </h2>
          <p className={css.subtitle}>
            Once your device is configured, you can use it to generate 2FA codes. They will be valid for ~30 seconds.
          </p>
          <form className={css.form}>
            <label className={css.label}>Your MFA Code</label>
            <input 
              className={css.input} 
              type="text" 
              value={code} 
              onChange={(e)=> setCode(e.target.value)} 
            />
          </form>
          <button 
            className={css.button} 
            disabled={code.length !== 6}
            onClick={handleClick}
            type="submit"
          >
            Verify
          </button>
          {!!result && (
            <div className={css.result}>
              <p data-status={isAuthOK ? 'ok' : 'ko'} className={css.message}>{result}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )

}

export default Home