import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, User, Feather } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAuth()

  const handleSubmit = async (e) => {
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
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-wax-red blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-wax-gold blur-3xl"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Wax Seal Header */}
        <div className="text-center mb-8">
          <motion.div 
            className="w-28 h-28 mx-auto mb-6 rounded-full wax-seal flex items-center justify-center shadow-2xl animate-seal"
            whileHover={{ scale: 1.05, rotate: 5 }}
          >
            <Feather className="w-14 h-14 text-parchment-100 drop-shadow-md" />
          </motion.div>
          <h1 className="font-serif text-5xl text-ink mb-3 tracking-wide">Slow Letters</h1>
          <p className="font-script text-2xl text-ink-light italic">"Good things take time"</p>
        </div>

        {/* Auth Card */}
        <div className="vintage-card rounded-lg overflow-hidden">
          {/* Toggle */}
          <div className="flex border-b border-[#d4c4a8] bg-[#e6d5b5]/50">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-4 font-serif text-lg transition-all duration-300 relative ${
                isLogin 
                  ? 'text-ink font-semibold' 
                  : 'text-ink-light hover:text-ink'
              }`}
            >
              Sign In
              {isLogin && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-wax-red"
                />
              )}
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-4 font-serif text-lg transition-all duration-300 relative ${
                !isLogin 
                  ? 'text-ink font-semibold' 
                  : 'text-ink-light hover:text-ink'
              }`}
            >
              Join
              {!isLogin && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-wax-red"
                />
              )}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 overflow-hidden"
                >
                  <div className="relative group">
                    <User className="absolute left-4 top-3.5 w-5 h-5 text-ink-light group-focus-within:text-wax-red transition-colors" />
                    <input
                      type="text"
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="vintage-input w-full pl-12 pr-4 py-3 rounded-md text-lg"
                      required
                    />
                  </div>
                  <div className="relative group">
                    <Feather className="absolute left-4 top-3.5 w-5 h-5 text-ink-light group-focus-within:text-wax-red transition-colors" />
                    <input
                      type="text"
                      placeholder="Display Name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="vintage-input w-full pl-12 pr-4 py-3 rounded-md text-lg"
                      required
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative group">
              <Mail className="absolute left-4 top-3.5 w-5 h-5 text-ink-light group-focus-within:text-wax-red transition-colors" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="vintage-input w-full pl-12 pr-4 py-3 rounded-md text-lg"
                required
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-3.5 w-5 h-5 text-ink-light group-focus-within:text-wax-red transition-colors" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="vintage-input w-full pl-12 pr-4 py-3 rounded-md text-lg"
                required
              />
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 bg-red-50 border border-red-200 rounded-md flex items-center gap-3 text-red-800 font-body text-sm"
              >
                <span className="text-xl">⚠</span>
                {error}
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="vintage-btn w-full py-4 rounded-md font-serif text-xl tracking-wider disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-parchment-100 border-t-transparent rounded-full"
                  />
                  Sealing...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-3">
                  <span>{isLogin ? 'Open Mailbox' : 'Create Account'}</span>
                  <span className="text-2xl">✉</span>
                </span>
              )}
            </motion.button>
          </form>
        </div>

        <p className="text-center mt-6 font-body text-sm text-ink-light italic">
          By joining, you agree to take time to write thoughtful letters
        </p>
      </motion.div>
    </div>
  )
}