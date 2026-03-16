import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence, LazyMotion, domAnimation } from 'framer-motion'
import { Mail, Lock, User, Feather, BookOpen } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

// Simple fade animation for mobile performance
const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 }
}

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAuth()

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        await signIn(email, password)
      } else {
        await signUp(email, password, username, displayName)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [isLogin, email, password, username, displayName, signIn, signUp])

  const toggleMode = useCallback(() => {
    setIsLogin(prev => !prev)
    setError('')
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-amber-50 p-4">
      <div className="w-full max-w-md">
        {/* Static Header - No animation for performance */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-900 flex items-center justify-center shadow-lg">
            <BookOpen className="w-10 h-10 text-amber-100" />
          </div>
          <h1 className="font-serif text-4xl text-amber-950 mb-2 font-bold">Slow Letters</h1>
          <p className="font-body text-amber-700 italic">"Good things take time"</p>
        </div>

        {/* Auth Card */}
        <div className="bg-amber-100 rounded-lg shadow-xl border-2 border-amber-300 overflow-hidden">
          {/* Toggle */}
          <div className="flex border-b-2 border-amber-300">
            <button
              onClick={() => !isLogin && toggleMode()}
              className={`flex-1 py-3 font-serif text-base transition-colors ${
                isLogin 
                  ? 'bg-amber-200 text-amber-950 border-b-2 border-red-900' 
                  : 'text-amber-700 hover:bg-amber-50'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => isLogin && toggleMode()}
              className={`flex-1 py-3 font-serif text-base transition-colors ${
                !isLogin 
                  ? 'bg-amber-200 text-amber-950 border-b-2 border-red-900' 
                  : 'text-amber-700 hover:bg-amber-50'
              }`}
            >
              Join
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <AnimatePresence mode="wait" initial={false}>
              {!isLogin && (
                <motion.div
                  key="signup-fields"
                  {...fadeIn}
                  className="space-y-4"
                >
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-5 h-5 text-amber-600" />
                    <input
                      type="text"
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-amber-50 border-2 border-amber-300 rounded-md font-body text-amber-900 focus:outline-none focus:border-red-900"
                      required
                    />
                  </div>
                  <div className="relative">
                    <Feather className="absolute left-3 top-3 w-5 h-5 text-amber-600" />
                    <input
                      type="text"
                      placeholder="Display Name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-amber-50 border-2 border-amber-300 rounded-md font-body text-amber-900 focus:outline-none focus:border-red-900"
                      required
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-amber-600" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-amber-50 border-2 border-amber-300 rounded-md font-body text-amber-900 focus:outline-none focus:border-red-900"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-amber-600" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-amber-50 border-2 border-amber-300 rounded-md font-body text-amber-900 focus:outline-none focus:border-red-900"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-100 border border-red-300 text-red-800 rounded-md text-sm font-body">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-red-900 text-amber-100 font-serif text-lg rounded-md hover:bg-red-800 transition-colors disabled:opacity-50"
            >
              {loading ? 'Please wait...' : isLogin ? 'Open Mailbox' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center mt-4 font-body text-xs text-amber-600">
          By joining, you agree to write with intention
        </p>
      </div>
    </div>
  )
}