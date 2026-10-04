import { useState } from 'react'

export default function AuthBar({ auth }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('sign-in')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  if (auth.user) {
    return (
      <div className="auth-bar">
        <span className="auth-status">Synced as {auth.user.email}</span>
        <button type="button" onClick={auth.signOut}>
          Sign out
        </button>
      </div>
    )
  }

  async function submit(e) {
    e.preventDefault()
    setError('')
    setNotice('')
    setBusy(true)
    try {
      if (mode === 'sign-in') {
        await auth.signIn(email, password)
      } else {
        await auth.signUp(email, password)
        setNotice('Check your email to confirm the account, then sign in.')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="auth-bar auth-form" onSubmit={submit}>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        minLength={6}
        required
      />
      <button type="submit" disabled={busy}>
        {mode === 'sign-in' ? 'Sign in' : 'Sign up'}
      </button>
      <button type="button" className="link-button" onClick={() => setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in')}>
        {mode === 'sign-in' ? 'Need an account?' : 'Have an account?'}
      </button>
      {error && <span className="auth-error">{error}</span>}
      {notice && <span className="auth-notice">{notice}</span>}
    </form>
  )
}
