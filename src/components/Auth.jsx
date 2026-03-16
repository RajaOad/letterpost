import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, User, Feather, BookOpen } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

// Mobile detection
const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

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
    <div className="min-h-screen flex items-center justify-center bg-amber-100 p-4 relative overflow-hidden">
      {/* Simplified background - no heavy SVG filters on mobile */}
      {!isMobile && (
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.15'/%3E%3C/svg%3E")`
        }}></div>
      )}

      {/* Decorative elements - hidden on mobile */}
      {!isMobile && (
        <>
          <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-red-900/5 blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-amber-900/5 blur-3xl"></div>
        </>
      )}

      <motion.div 
        initial={isMobile ? false : { opacity: 0, y: 30 }}
        animate={isMobile ? false : { opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Wax Seal Header - simplified on mobile */}
        <div className="text-center mb-6 md:mb-8">
          <motion.div 
            className="w-20 h-20 md:w-28 md:h-28 mx-auto mb-4 md:mb-6 rounded-full bg-linear-to-br from-red-800 via-red-700 to-red-900 flex items-center justify-center shadow-2xl border-4 border-amber-200"
            animate={isMobile ? {} : { rotate: [0, 5, -5, 0] }}
            transition={isMobile ? {} : { duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <BookOpen className="w-10 h-10 md:w-14 md:h-14 text-amber-100" />
          </motion.div>
          <h1 className="font-serif text-4xl md:text-5xl text-amber-950 mb-2 md:mb-3 font-bold tracking-wide">Slow Letters</h1>
          <p className="font-body text-amber-700 italic text-base md:text-lg">"Good things take time"</p>
        </div>

        {/* Auth Card */}
        <div className="bg-amber-50 rounded-sm shadow-2xl border-2 border-amber-300 overflow-hidden relative">
          {/* Texture - only on desktop */}
          {!isMobile && (
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.15'/%3E%3C/svg%3E")`
            }}></div>
          )}

          {/* Toggle */}
          <div className="flex border-b-2 border-amber-300 relative">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 md:py-4 font-serif text-base md:text-lg transition-all relative ${
                isLogin 
                  ? 'bg-amber-200 text-amber-950 font-bold' 
                  : 'text-amber-700 hover:bg-amber-100/50'
              }`}
            >
              Sign In
              {isLogin && <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-800"></div>}
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 md:py-4 font-serif text-base md:text-lg transition-all relative ${
                !isLogin 
                  ? 'bg-amber-200 text-amber-950 font-bold' 
                  : 'text-amber-700 hover:bg-amber-100/50'
              }`}
            >
              Join
              {!isLogin && <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-800"></div>}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-4 md:space-y-6 relative">
            {!isLogin && (
              <div className="space-y-4">
                <div className="relative">
                  <User className="absolute left-4 top-3.5 w-5 h-5 text-amber-600" />
                  <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-[#fdfbf7] border-2 border-amber-300 rounded-sm font-body text-amber-900 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-500 transition-all"
                    required
                  />
                </div>
                <div className="relative">
                  <Feather className="absolute left-4 top-3.5 w-5 h-5 text-amber-600" />
                  <input
                    type="text"
                    placeholder="Display Name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-[#fdfbf7] border-2 border-amber-300 rounded-sm font-body text-amber-900 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-500 transition-all"
                    required
                  />
                </div>
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-5 h-5 text-amber-600" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[#fdfbf7] border-2 border-amber-300 rounded-sm font-body text-amber-900 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-500 transition-all"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-5 h-5 text-amber-600" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[#fdfbf7] border-2 border-amber-300 rounded-sm font-body text-amber-900 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-500 transition-all"
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
              className="w-full py-3 md:py-4 bg-linear-to-r from-red-900 via-red-800 to-red-900 text-amber-100 font-serif text-lg md:text-xl rounded-sm hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed border-2 border-red-950 font-bold tracking-wide"
            >
              {loading ? 'Sealing envelope...' : isLogin ? 'Open Mailbox' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center mt-4 md:mt-6 font-body text-xs md:text-sm text-amber-700/70 italic">
          By joining, you pledge to write with intention and patience
        </p>
      </motion.div>
    </div>
  )
}