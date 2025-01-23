import { useState } from "react"
import css from './Verify.module.css'

const Verify = ()=> {

  const [code, setCode] = useState('')
  const [result, setResult] = useState('')

  const handleClick = (e)=> {
    fetch(`/validate?code=${code}`)
      .then(res => res.text())
      .then(setResult)
  }

  const isAuthOK = result === 'Valid code'

  return (
    <div className={css.verify}>
      <header className={css.header}>Multifactor Authentication Demo</header>
      <div className={css.content}>
        <h2 className={css.title}>
          Service validation
        </h2>
        <p className={css.subtitle}>
          In this case, the secret is stored in <strong>Netlify</strong> (using environment variables) 
          and the 2FA validation is done using <strong>Netlify Functions</strong>.
        </p>
        <form className={css.form}>
          <label className={css.label}>Secret MFA Code</label>
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
  )
}

export default Verify