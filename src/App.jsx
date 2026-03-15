import React from 'react'
import { motion } from 'framer-motion'
import { AuthProvider } from './contexts/AuthContext'
import Auth from './components/Auth'
import Mailbox from './components/Mailbox'
import LetterEditor from './components/LetterEditor'
import LetterView from './components/LetterView'
import Navigation from './components/Navigation'
import { useAuth } from './contexts/AuthContext'

function AppContent() {
  const { user, loading } = useAuth()
  const [currentView, setCurrentView] = React.useState('mailbox')
  const [selectedLetter, setSelectedLetter] = React.useState(null)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-100 via-amber-50 to-amber-100">
        <div className="text-center">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 border-4 border-amber-900 border-t-transparent rounded-full mx-auto mb-6"
          />
          <p className="font-serif text-2xl text-amber-900 italic">Sorting the post...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Auth />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-amber-100/30 to-amber-50 relative">
      {/* Rich background texture */}
      <div className="fixed inset-0 opacity-20 pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.5'/%3E%3C/svg%3E")`
      }}></div>

      <div className="relative z-10">
        <Navigation 
          currentView={currentView} 
          setCurrentView={setCurrentView}
          setSelectedLetter={setSelectedLetter}
        />
        <main className="container mx-auto px-4 py-12 max-w-6xl">
          {currentView === 'mailbox' && (
            <Mailbox 
              onOpenLetter={(letter) => {
                setSelectedLetter(letter)
                setCurrentView('letter')
              }}
            />
          )}
          {currentView === 'compose' && (
            <LetterEditor 
              onSent={() => setCurrentView('mailbox')}
            />
          )}
          {currentView === 'letter' && selectedLetter && (
            <LetterView 
              letter={selectedLetter}
              onBack={() => {
                setSelectedLetter(null)
                setCurrentView('mailbox')
              }}
            />
          )}
        </main>
      </div>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App