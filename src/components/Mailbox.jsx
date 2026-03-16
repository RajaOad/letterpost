import React, { useEffect, useState, useCallback, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Send, Mail, Trash2, Inbox, Feather, AlertCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { getLetters, supabase } from '../lib/supabase'
import { format } from 'date-fns'

// Memoized card component for performance
const EnvelopeCard = memo(({ letter, status, isReceived, onClick }) => {
  const waxColors = {
    red: 'bg-red-900',
    green: 'bg-green-900',
    blue: 'bg-blue-900',
    gold: 'bg-yellow-700',
  }

  const statusConfig = {
    transit: { color: 'text-amber-800', bg: 'bg-amber-100', border: 'border-amber-400', label: 'Traveling', sealOpacity: 'opacity-60' },
    delivered: { color: 'text-red-900', bg: 'bg-red-50', border: 'border-red-400', label: 'New', sealOpacity: 'opacity-100' },
    read: { color: 'text-amber-900', bg: 'bg-amber-50', border: 'border-amber-300', label: 'Read', sealOpacity: 'opacity-80' },
    sent: { color: 'text-amber-800', bg: 'bg-amber-50', border: 'border-amber-300', label: 'Sent', sealOpacity: 'opacity-70' },
  }

  const config = statusConfig[status]

  return (
    <div 
      onClick={onClick}
      className={`
        relative h-full bg-amber-50 rounded-lg shadow-md hover:shadow-xl transition-shadow
        border-2 ${config.border} overflow-hidden cursor-pointer
      `}
    >
      <div className="relative p-4 sm:p-5 flex flex-col h-full">
        <div className="flex justify-between items-start mb-3">
          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${waxColors[letter.wax_color || 'red']} shadow-lg flex items-center justify-center transform rotate-12 ${config.sealOpacity} ring-2 ring-amber-200`}>
            <span className="font-serif text-lg sm:text-xl text-amber-100 font-bold">
              {isReceived ? letter.sender?.display_name?.[0] : letter.recipient?.display_name?.[0]}
            </span>
          </div>
          
          <div className={`px-2 py-1 rounded ${config.bg} ${config.color} border border-current`}>
            <span className="font-serif text-xs font-bold uppercase">{config.label}</span>
          </div>
        </div>

        <div className="mb-2">
          <p className="font-body text-[10px] sm:text-xs text-amber-600 uppercase mb-0.5">
            {isReceived ? 'From' : 'To'}
          </p>
          <h3 className="font-serif text-lg sm:text-xl text-amber-950 font-bold leading-tight">
            {isReceived ? letter.sender?.display_name : letter.recipient?.display_name}
          </h3>
          <p className="font-body text-xs text-amber-600 italic">
            @{isReceived ? letter.sender?.username : letter.recipient?.username}
          </p>
        </div>

        <div className="flex-grow">
          <div className="w-8 h-0.5 bg-amber-800/20 mb-2"></div>
          <h4 className="font-serif text-sm sm:text-base text-amber-950 leading-snug line-clamp-2 font-semibold">
            {letter.subject}
          </h4>
        </div>

        <div className="mt-3 pt-2 border-t border-amber-800/10 flex items-center justify-between">
          <span className="font-body text-[10px] sm:text-xs text-amber-600">
            {format(new Date(letter.created_at), 'MMM d, yyyy')}
          </span>
          
          {status === 'transit' && (
            <span className="font-body text-[10px] text-amber-700 flex items-center gap-1 bg-amber-200 px-1.5 py-0.5 rounded">
              <Clock className="w-2.5 h-2.5" />
              En route
            </span>
          )}
        </div>
      </div>
    </div>
  )
})

EnvelopeCard.displayName = 'EnvelopeCard'

export default function Mailbox({ onOpenLetter }) {
  const { user } = useAuth()
  const [letters, setLetters] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [deleteError, setDeleteError] = useState(null)

  // Fetch letters only once on mount
  useEffect(() => {
    let mounted = true
    
    const fetchLetters = async () => {
      try {
        const data = await getLetters(user.id)
        if (mounted) {
          setLetters(data)
          setLoading(false)
        }
      } catch (error) {
        console.error('Error fetching letters:', error)
        if (mounted) setLoading(false)
      }
    }

    fetchLetters()
    
    // Simple interval refresh instead of realtime for performance
    const interval = setInterval(fetchLetters, 30000) // Refresh every 30 seconds
    
    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [user])

  const handleDelete = useCallback(async (letterId, e) => {
    e.stopPropagation()
    
    if (deleteConfirm === letterId) {
      try {
        const letter = letters.find(l => l.id === letterId)
        if (!letter || letter.sender_id !== user.id) {
          setDeleteError('You can only burn letters you have sent')
          setDeleteConfirm(null)
          return
        }

        const { error } = await supabase
          .from('letters')
          .delete()
          .eq('id', letterId)
          .eq('sender_id', user.id)

        if (error) {
          setDeleteError(error.message)
          return
        }

        // Update local state without refetching
        setLetters(prev => prev.filter(l => l.id !== letterId))
        setDeleteConfirm(null)
      } catch (err) {
        setDeleteError(err.message)
      }
    } else {
      setDeleteConfirm(letterId)
      setTimeout(() => {
        setDeleteConfirm(prev => prev === letterId ? null : prev)
      }, 3000)
    }
  }, [deleteConfirm, letters, user])

  const getLetterStatus = useCallback((letter) => {
    const now = new Date()
    const deliveryTime = new Date(letter.delivery_at)
    
    if (letter.status === 'read') return 'read'
    if (letter.status === 'delivered' && letter.recipient_id === user.id) return 'delivered'
    if (deliveryTime > now) return 'transit'
    if (letter.sender_id === user.id) return 'sent'
    return 'delivered'
  }, [user])

  const filteredLetters = letters.filter(letter => {
    const status = getLetterStatus(letter)
    
    if (filter === 'all') return true
    if (filter === 'received') return letter.recipient_id === user.id && status !== 'transit'
    if (filter === 'sent') return letter.sender_id === user.id && status !== 'transit'
    if (filter === 'transit') {
      const now = new Date()
      const deliveryTime = new Date(letter.delivery_at)
      return deliveryTime > now
    }
    return true
  })

  const counts = {
    all: letters.length,
    received: letters.filter(l => l.recipient_id === user.id && new Date(l.delivery_at) <= new Date()).length,
    sent: letters.filter(l => l.sender_id === user.id && new Date(l.delivery_at) <= new Date()).length,
    transit: letters.filter(l => new Date(l.delivery_at) > new Date()).length,
  }

  const handleLetterClick = useCallback((letter) => {
    onOpenLetter(letter)
  }, [onOpenLetter])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-serif text-lg text-amber-900 italic">Sorting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-2 sm:px-0">
      {/* Error Display */}
      {deleteError && (
        <div className="p-3 bg-red-100 border border-red-300 rounded text-red-800 font-body text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{deleteError}</span>
          <button onClick={() => setDeleteError(null)} className="ml-auto underline text-xs">Dismiss</button>
        </div>
      )}

      {/* Header */}
      <div className="text-center pb-4 border-b-2 border-amber-800/20">
        <h1 className="font-serif text-3xl sm:text-4xl text-amber-950 mb-1 font-bold">The Post Office</h1>
        <p className="font-body text-sm text-amber-700 italic">Your correspondence chamber</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap justify-center gap-2">
        {[
          { key: 'all', label: 'All', icon: Inbox, count: counts.all },
          { key: 'received', label: 'Received', icon: Mail, count: counts.received },
          { key: 'sent', label: 'Sent', icon: Send, count: counts.sent },
          { key: 'transit', label: 'Transit', icon: Clock, count: counts.transit },
        ].map(({ key, label, icon: Icon, count }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded font-serif text-sm border-2 transition-all ${
              filter === key 
                ? 'bg-amber-900 text-amber-50 border-amber-900' 
                : 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{label}</span>
            <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${filter === key ? 'bg-amber-700' : 'bg-amber-200'}`}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Letters Grid */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {filteredLetters.map((letter) => {
          const status = getLetterStatus(letter)
          const isReceived = letter.recipient_id === user.id
          const canDelete = letter.sender_id === user.id
          
          return (
            <div key={letter.id} className="relative group">
              <EnvelopeCard 
                letter={letter} 
                status={status} 
                isReceived={isReceived}
                onClick={() => handleLetterClick(letter)}
              />
              
              {canDelete && (
                <button
                  onClick={(e) => handleDelete(letter.id, e)}
                  className={`absolute top-2 right-2 p-1.5 rounded-full shadow-md transition-all z-10 border ${
                    deleteConfirm === letter.id 
                      ? 'bg-red-900 text-amber-100 border-red-900 animate-pulse' 
                      : 'bg-amber-100 text-amber-900 border-amber-300 opacity-0 group-hover:opacity-100 hover:bg-red-900 hover:text-amber-100'
                  }`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )
        })}
      </div>

      {filteredLetters.length === 0 && (
        <div className="text-center py-12 bg-amber-50/50 rounded-lg border-2 border-dashed border-amber-300">
          <Feather className="w-12 h-12 mx-auto text-amber-300 mb-3" />
          <p className="font-serif text-2xl text-amber-800 mb-1">The desk is clear</p>
          <p className="font-body text-amber-600 italic">No letters await</p>
        </div>
      )}
    </div>
  )
}