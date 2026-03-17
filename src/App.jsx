import React from 'react'
import { motion, LazyMotion, domAnimation } from 'framer-motion'
import { AuthProvider } from './contexts/AuthContext'
import Auth from './components/Auth'
import ResetPassword from './components/ResetPassword'
import Mailbox from './components/Mailbox'
import LetterEditor from './components/LetterEditor'
import LetterView from './components/LetterView'
import Navigation from './components/Navigation'
import { useAuth } from './contexts/AuthContext'
import Profile from './components/Profile'

const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

function getPath() {
  if (typeof window === 'undefined') return '/'
  return window.location.pathname
}

function AppContent() {
  const { user, loading } = useAuth()
  const [currentView, setCurrentView] = React.useState('mailbox')
  const [selectedLetter, setSelectedLetter] = React.useState(null)
  const path = getPath()

  if (path === '/auth/reset-password') {
    return <ResetPassword />
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50 px-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-900 border-t-transparent rounded-full mx-auto mb-4 animate-spin" />
          <p className="font-serif text-xl text-amber-900 italic">Sorting the post...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Auth />
  }

  return (
    <div className="min-h-screen bg-amber-50 relative overflow-x-hidden">
      <div className="relative z-10">
        <Navigation 
          currentView={currentView} 
          setCurrentView={setCurrentView}
          setSelectedLetter={setSelectedLetter}
        />
        <main className="w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12 max-w-7xl mx-auto">
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
          {currentView === 'profile' && (
  <Profile 
    onBack={() => setCurrentView('mailbox')}
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
      <LazyMotion features={domAnimation}>
        <AppContent />
      </LazyMotion>
    </AuthProvider>
  )
}

export default App