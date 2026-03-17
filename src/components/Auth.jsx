import React, { useState } from 'react'
import { Mail, Lock, User, Feather, BookOpen, ArrowLeft, CheckCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

export default function Auth() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const { signIn, signUp, resetPassword } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')
    setLoading(true)

    try {
      if (mode === 'login') {
        await signIn(email, password)
      } else if (mode === 'signup') {
        await signUp(email, password, username, displayName)
      } else if (mode === 'forgot') {
        await resetPassword(email)
        setMode('reset-sent')
        setSuccessMessage('Check your inbox for the reset link')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const switchMode = (newMode) => {
    setMode(newMode)
    setError('')
    setSuccessMessage('')
    if (newMode !== 'login') setPassword('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-amber-100 relative overflow-hidden pd-y2">
      {!isMobile && (
        <>
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.15'/%3E%3C/svg%3E")`
          }}></div>
          <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-red-900/5 blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-amber-900/5 blur-3xl"></div>
        </>
      )}

      <div className="w-full max-w-md relative z-10 p-4 pd-x">
        <div className="text-center mb-6 md:mb-8">
          <div className="w-20 h-20 md:w-28 md:h-28 mx-auto mb-4 md:mb-6 rounded-full bg-linear-to-br from-red-800 via-red-700 to-red-900 flex items-center justify-center shadow-xl border-4 border-amber-200">
            <BookOpen className="w-10 h-10 md:w-14 md:h-14 text-amber-100" />
          </div>
          <h1 className="font-serif text-4xl md:text-5xl text-amber-950 mb-2 md:mb-3 font-bold tracking-wide">Slow Letters</h1>
          <p className="font-body text-amber-700 italic text-base md:text-lg">"Good things take time"</p>
        </div>

        <div className="bg-amber-50 rounded-sm shadow-xl border-2 border-amber-300 overflow-hidden relative">
          {!isMobile && (
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.15'/%3E%3C/svg%3E")`
            }}></div>
          )}

          {mode !== 'forgot' && mode !== 'reset-sent' && (
            <div className="flex border-b-2 border-amber-300 relative">
              <button
                onClick={() => switchMode('login')}
                className={`flex-1 py-3 pd-xy md:py-4 font-serif text-base md:text-lg transition-all relative ${
                  mode === 'login' 
                    ? 'bg-amber-200 text-amber-950 font-bold' 
                    : 'text-amber-700 hover:bg-amber-100/50'
                }`}
              >
                Sign In
                {mode === 'login' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-800"></div>}
              </button>
              <button
                onClick={() => switchMode('signup')}
                className={`flex-1 py-3 pd-xy md:py-4 font-serif text-base md:text-lg transition-all relative ${
                  mode === 'signup' 
                    ? 'bg-amber-200 text-amber-950 font-bold' 
                    : 'text-amber-700 hover:bg-amber-100/50'
                }`}
              >
                Join
                {mode === 'signup' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-800"></div>}
              </button>
            </div>
          )}

          {(mode === 'forgot' || mode === 'reset-sent') && (
            <div className="border-b-2 border-amber-300 bg-amber-100/50 pd-xy">
              <button
                onClick={() => switchMode('login')}
                className="flex items-center gap-2 px-6 py-3 text-amber-700 hover:text-amber-900 transition-colors font-body text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-4 md:space-y-6 relative">
            {mode === 'signup' && (
              <div className="space-y-4">
                <div className="relative">
                  <User className="absolute left-0 top-3.5 w-5 h-5 text-amber-600" />
                  <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 pd-xy bg-[#fdfbf7] border-2 border-amber-300 rounded-sm font-body text-amber-900 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-500 transition-all"
                    required
                  />
                </div>
                <div className="relative">
                  <Feather className="absolute left-0 top-3.5 w-5 h-5 text-amber-600" />
                  <input
                    type="text"
                    placeholder="Display Name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 pd-xy bg-[#fdfbf7] border-2 border-amber-300 rounded-sm font-body text-amber-900 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-500 transition-all"
                    required
                  />
                </div>
              </div>
            )}

            {mode !== 'reset-sent' && (
              <div className="relative">
                <Mail className="absolute left-0 top-3.5 w-5 h-5 text-amber-600" />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 pd-xy bg-[#fdfbf7] border-2 border-amber-300 rounded-sm font-body text-amber-900 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-500 transition-all"
                  required
                />
              </div>
            )}

            {(mode === 'login' || mode === 'signup') && (
              <div className="relative">
                <Lock className="absolute left-0 top-3.5 w-5 h-5 text-amber-600" />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 pd-xy bg-[#fdfbf7] border-2 border-amber-300 rounded-sm font-body text-amber-900 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-500 transition-all"
                  required
                />
              </div>
            )}

            {mode === 'login' && (
              <div className="flex justify-end pd-x mr-sm">
                <button
                  type="button"
                  onClick={() => switchMode('forgot')}
                  className="text-sm text-amber-600 hover:text-red-800 font-body italic transition-colors"
                >
                  Forgot your key?
                </button>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-100 border-2 border-red-300 text-red-800 rounded-sm text-sm font-body flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                {error}
              </div>
            )}

            {mode === 'reset-sent' && (
              <div className="p-6 text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="font-serif text-xl text-amber-950 mb-2">Reset Link Sent</h3>
                  <p className="font-body text-amber-700 text-sm">
                    We've dispatched a letter to <strong>{email}</strong> with instructions to reset your password. Please check your inbox (and spam folder).
                  </p>
                </div>
              </div>
            )}

            {mode !== 'reset-sent' && (
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 pd-xy md:py-4 bg-linear-to-r from-red-900 via-red-800 to-red-900 text-amber-100 font-serif text-lg md:text-xl rounded-sm hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed border-2 border-red-950 font-bold tracking-wide"
              >
                {loading ? 'Sealing envelope...' : 
                  mode === 'login' ? 'Open Mailbox' : 
                  mode === 'signup' ? 'Create Account' : 
                  'Send Reset Letter'}
              </button>
            )}

            {mode === 'reset-sent' && (
              <button
                type="button"
                onClick={() => switchMode('forgot')}
                className="w-full py-3 text-amber-600 hover:text-amber-800 font-body text-sm transition-colors"
              >
                Didn't receive it? Try again
              </button>
            )}
          </form>
        </div>

        <p className="text-center mt-4 md:mt-6 font-body text-xs md:text-sm text-amber-700/70 italic px-4">
          By joining, you pledge to write with intention and patience
        </p>
      </div>
    </div>
  )
}