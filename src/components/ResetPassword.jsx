import React, { useState } from 'react'
import { Lock, BookOpen, CheckCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { updatePassword } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('The keys do not match')
      return
    }

    if (password.length < 6) {
      setError('Key must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      await updatePassword(password)
      setSuccess(true)
      setTimeout(() => {
        window.location.href = '/auth'
      }, 2000)
    } catch (err) {
      setError(err.message || 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-100 p-4 pd-y2">
        <div className="w-full max-w-md bg-amber-50 rounded-sm shadow-xl border-2 border-amber-300 p-8 text-center relative">
          {!isMobile && (
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.15'/%3E%3C/svg%3E")`
            }}></div>
          )}
          <div className="relative">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="font-serif text-2xl text-amber-950 mb-4 font-bold">Password Updated</h2>
            <p className="font-body text-amber-700 mb-4">
              Your key has been forged anew. Redirecting to sign in...
            </p>
          </div>
        </div>
      </div>
    )
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
          <h1 className="font-serif text-3xl md:text-4xl text-amber-950 mb-2 md:mb-3 font-bold tracking-wide">Forged Anew</h1>
          <p className="font-body text-amber-700 italic text-base md:text-lg">Create a new key for your mailbox</p>
        </div>

        <div className="bg-amber-50 rounded-sm shadow-xl border-2 border-amber-300 overflow-hidden relative">
          {!isMobile && (
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.15'/%3E%3C/svg%3E")`
            }}></div>
          )}

          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-4 md:space-y-6 relative">
            <div className="relative">
              <Lock className="absolute left-0 top-3.5 w-5 h-5 text-amber-600" />
              <input
                type="password"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 pd-xy bg-[#fdfbf7] border-2 border-amber-300 rounded-sm font-body text-amber-900 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-500 transition-all"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-0 top-3.5 w-5 h-5 text-amber-600" />
              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 pd-xy bg-[#fdfbf7] border-2 border-amber-300 rounded-sm font-body text-amber-900 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-500 transition-all"
                required
              />
            </div>

            {error && (
              <div className="p-4 bg-red-100 border-2 border-red-300 text-red-800 rounded-sm text-sm font-body flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 pd-xy md:py-4 bg-linear-to-r from-red-900 via-red-800 to-red-900 text-amber-100 font-serif text-lg md:text-xl rounded-sm hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed border-2 border-red-950 font-bold tracking-wide"
            >
              {loading ? 'Forging new key...' : 'Set New Password'}
            </button>
          </form>
        </div>

        <p className="text-center mt-4 md:mt-6 font-body text-xs md:text-sm text-amber-700/70 italic px-4">
          Choose a key you shall not forget, yet keep it safe from prying eyes
        </p>
      </div>
    </div>
  )
}