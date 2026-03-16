import React, { Suspense, lazy } from 'react'
import { AuthProvider } from './contexts/AuthContext'
import { useAuth } from './contexts/AuthContext'

// Lazy load components for better performance
const Auth = lazy(() => import('./components/Auth'))
const Mailbox = lazy(() => import('./components/Mailbox'))
const LetterEditor = lazy(() => import('./components/LetterEditor'))
const LetterView = lazy(() => import('./components/LetterView'))
const Navigation = lazy(() => import('./components/Navigation'))

// Simple loading fallback
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-amber-50">
    <div className="w-12 h-12 border-4 border-amber-900 border-t-transparent rounded-full animate-spin"></div>
  </div>
)

function AppContent() {
  const { user, loading } = useAuth()
  const [currentView, setCurrentView] = React.useState('mailbox')
  const [selectedLetter, setSelectedLetter] = React.useState(null)

  if (loading) {
    return <LoadingFallback />
  }

  if (!user) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <Auth />
      </Suspense>
    )
  }

  return (
    <div className="min-h-screen bg-amber-50">
      <Suspense fallback={<LoadingFallback />}>
        <Navigation 
          currentView={currentView} 
          setCurrentView={setCurrentView}
          setSelectedLetter={setSelectedLetter}
        />
      </Suspense>
      
      <main className="container mx-auto px-4 py-6 max-w-6xl">
        <Suspense fallback={<LoadingFallback />}>
          {currentView === 'mailbox' && (
            <Mailbox onOpenLetter={(letter) => {
              setSelectedLetter(letter)
              setCurrentView('letter')
            }} />
          )}
          {currentView === 'compose' && (
            <LetterEditor onSent={() => setCurrentView('mailbox')} />
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
        </Suspense>
      </main>
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