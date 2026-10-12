import { useEffect, useState, useRef } from 'react'
import { FaRandom, FaUndo, FaVideo, FaChevronDown } from 'react-icons/fa'
import TRANSLATIONS from '../i18n/translations.json'
import LANGUAGES from '../i18n/languages.json'

const KEY_MAP = {
  u: 'U',
  d: 'D',
  l: 'L',
  r: 'R',
  f: 'F',
  b: 'B',
}

function LanguageDropdown({ language, onLanguageChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0]

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="language-dropdown" ref={dropdownRef}>
      <button
        className="language-toggle"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <span className="lang-flag">{currentLang.flag}</span>
        <span className="lang-abbr">{currentLang.abbr}</span>
        <FaChevronDown className={`lang-caret ${isOpen ? 'open' : ''}`} />
      </button>
      {isOpen && (
        <div className="language-menu">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              className={`language-option ${lang.code === language ? 'active' : ''}`}
              onClick={() => {
                onLanguageChange(lang.code)
                setIsOpen(false)
              }}
              type="button"
            >
              <span className="lang-flag">{lang.flag}</span>
              <span className="lang-abbr">{lang.abbr}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Controls({ onMove, onShuffle, onReset, onResetCamera, disabled, language, onLanguageChange }) {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en

  const MOVE_GROUPS = [
    { label: t.upper, moves: ['U', "U'"] },
    { label: t.down, moves: ['D', "D'"] },
    { label: t.left, moves: ['L', "L'"] },
    { label: t.right, moves: ['R', "R'"] },
    { label: t.front, moves: ['F', "F'"] },
    { label: t.back, moves: ['B', "B'"] },
  ]

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (disabled) return
      if (e.target.tagName === 'BUTTON' || e.target.tagName === 'SELECT') return

      const key = e.key.toLowerCase()
      const move = KEY_MAP[key]

      if (move) {
        e.preventDefault()
        const finalMove = e.shiftKey ? `${move}'` : move
        onMove(finalMove)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onMove, disabled])

  return (
    <div className="controls">
      <div className="controls-header">
        <h2>{t.controls}</h2>
        <LanguageDropdown language={language} onLanguageChange={onLanguageChange} />
      </div>
      <div className="hints">
        <p className="hint">{t.hintDrag}</p>
        <p className="hint">{t.hintShift}</p>
      </div>

      <div className="move-buttons">
        {MOVE_GROUPS.map((group) => (
          <div key={group.label} className="move-group">
            <span className="move-label">{group.label}</span>
            <div className="move-pair">
              {group.moves.map((move) => (
                <button
                  key={move}
                  className="move-button"
                  onClick={() => onMove(move)}
                  disabled={disabled}
                >
                  {move}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="action-buttons">
        <button
          className="action-button shuffle"
          onClick={onShuffle}
          disabled={disabled}
        >
          <FaRandom className="button-icon" />
          {t.shuffle}
        </button>
        <button
          className="action-button reset"
          onClick={onReset}
          disabled={disabled}
        >
          <FaUndo className="button-icon" />
          {t.reset}
        </button>
        <button
          className="action-button camera-reset"
          onClick={onResetCamera}
        >
          <FaVideo className="button-icon" />
          {t.resetCamera}
        </button>
      </div>
    </div>
  )
}
