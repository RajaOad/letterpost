import React from 'react'
import { PenLine, LogOut, Inbox } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

export default function Navigation({ currentView, setCurrentView, setSelectedLetter }) {
  const { profile, signOut } = useAuth()

  const handleNav = (view) => {
    setCurrentView(view)
    if (view !== 'letter') setSelectedLetter(null)
  }

  return (
    <nav className="bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100 border-b-2 border-amber-800/20 shadow-xl relative">
      {/* NO texture on mobile */}
      {!isMobile && (
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.5'/%3E%3C/svg%3E")`
        }}></div>
      )}

      <div className="w-full px-4 sm:px-6 lg:px-8 py-3 md:py-5 max-w-7xl mx-auto relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-5">
            <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-red-900 via-red-800 to-red-950 shadow-lg flex items-center justify-center border-2 md:border-4 border-amber-200 shrink-0">
              <span className="font-serif text-xl md:text-3xl text-amber-100 font-bold">S</span>
            </div>
            <div className="min-w-0">
              <h2 className="font-serif text-xl md:text-3xl text-amber-950 font-bold tracking-wide truncate">Slow Letters</h2>
              <p className="font-body text-xs md:text-sm text-amber-700 italic truncate hidden sm:block">Welcome, {profile?.display_name}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 md:gap-3">
            <NavButton 
              active={currentView === 'mailbox'}
              onClick={() => handleNav('mailbox')}
              icon={<Inbox className="w-4 h-4 md:w-5 md:h-5" />}
              label="Mailbox"
            />
            <NavButton 
              active={currentView === 'compose'}
              onClick={() => handleNav('compose')}
              icon={<PenLine className="w-4 h-4 md:w-5 md:h-5" />}
              label="Compose"
            />
            <button
              onClick={signOut}
              className="ml-1 md:ml-4 p-2 md:p-3 text-amber-800 hover:text-red-900 hover:bg-red-100 rounded-full transition-colors border-2 border-transparent hover:border-red-800/20"
              title="Depart"
            >
              <LogOut className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

function NavButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 md:gap-3 px-3 md:px-6 py-2 md:py-3 rounded-sm font-serif transition-all border-2 text-sm md:text-base ${
        active 
          ? 'bg-gradient-to-r from-red-900 to-red-800 text-amber-50 border-red-950 shadow-lg' 
          : 'text-amber-900 border-amber-800/20 hover:bg-amber-200 hover:border-amber-800/40'
      }`}
    >
      {icon}
      <span className="hidden sm:inline font-bold tracking-wide">{label}</span>
    </button>
  )
}