import React from 'react'
import { motion } from 'framer-motion'
import { Mail, PenLine, LogOut, Inbox, Scroll } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function Navigation({ currentView, setCurrentView, setSelectedLetter }) {
  const { profile, signOut } = useAuth()

  const handleNav = (view) => {
    setCurrentView(view)
    if (view !== 'letter') setSelectedLetter(null)
  }

  return (
    <nav className="bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100 border-b-2 border-amber-800/20 shadow-xl relative">
      {/* Texture */}
      <div className="absolute inset-0 opacity-30 pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.5'/%3E%3C/svg%3E")`
      }}></div>

      <div className="container mx-auto px-4 py-5 max-w-6xl relative">
        <div className="flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-5"
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-900 via-red-800 to-red-950 shadow-2xl flex items-center justify-center border-4 border-amber-200">
              <span className="font-serif text-3xl text-amber-100 font-bold">S</span>
            </div>
            <div>
              <h2 className="font-serif text-3xl text-amber-950 font-bold tracking-wide">Slow Letters</h2>
              <p className="font-body text-sm text-amber-700 italic">Welcome, {profile?.display_name}</p>
            </div>
          </motion.div>

          <div className="flex items-center gap-3">
            <NavButton 
              active={currentView === 'mailbox'}
              onClick={() => handleNav('mailbox')}
              icon={<Inbox className="w-5 h-5" />}
              label="Mailbox"
            />
            <NavButton 
              active={currentView === 'compose'}
              onClick={() => handleNav('compose')}
              icon={<PenLine className="w-5 h-5" />}
              label="Compose"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={signOut}
              className="ml-4 p-3 text-amber-800 hover:text-red-900 hover:bg-red-100 rounded-full transition-all border-2 border-transparent hover:border-red-800/20"
              title="Depart"
            >
              <LogOut className="w-6 h-6" />
            </motion.button>
          </div>
        </div>
      </div>
    </nav>
  )
}

function NavButton({ active, onClick, icon, label }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`flex items-center gap-3 px-6 py-3 rounded-sm font-serif transition-all border-2 ${
        active 
          ? 'bg-gradient-to-r from-red-900 to-red-800 text-amber-50 border-red-950 shadow-lg' 
          : 'text-amber-900 border-amber-800/20 hover:bg-amber-200 hover:border-amber-800/40'
      }`}
    >
      {icon}
      <span className="hidden sm:inline font-bold tracking-wide">{label}</span>
    </motion.button>
  )
}