import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Send, Mail, Trash2, Inbox, Feather, AlertCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { getLetters, supabase } from '../lib/supabase'
import { format } from 'date-fns'

export default function Mailbox({ onOpenLetter }) {
  const { user } = useAuth()
  const [letters, setLetters] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [deleteError, setDeleteError] = useState(null)

  useEffect(() => {
    fetchLetters()
    
    const subscription = supabase
      .channel('letters')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'letters' },
        (payload) => {
          console.log('Change received!', payload)
          fetchLetters()
        }
      )
      .subscribe()

    return () => subscription.unsubscribe()
  }, [user])

  const fetchLetters = async () => {
    try {
      const data = await getLetters(user.id)
      console.log('Fetched letters:', data)
      setLetters(data)
    } catch (error) {
      console.error('Error fetching letters:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (letterId, e) => {
    e.stopPropagation()
    
    if (deleteConfirm === letterId) {
      try {
        console.log('Deleting letter:', letterId)
        
        // Check if user is the sender before deleting
        const letter = letters.find(l => l.id === letterId)
        if (!letter) {
          setDeleteError('Letter not found')
          return
        }
        
        if (letter.sender_id !== user.id) {
          setDeleteError('You can only burn letters you have sent')
          setDeleteConfirm(null)
          return
        }

        const { data, error } = await supabase
          .from('letters')
          .delete()
          .eq('id', letterId)
          .eq('sender_id', user.id) // Extra safety: only delete if sender
          .select()

        if (error) {
          console.error('Delete error:', error)
          setDeleteError(error.message)
          return
        }

        console.log('Delete success:', data)
        setDeleteConfirm(null)
        setDeleteError(null)
        fetchLetters()
      } catch (err) {
        console.error('Exception during delete:', err)
        setDeleteError(err.message)
      }
    } else {
      setDeleteConfirm(letterId)
      setTimeout(() => {
        setDeleteConfirm(prev => prev === letterId ? null : prev)
      }, 3000)
    }
  }

  const getLetterStatus = (letter) => {
    const now = new Date()
    const deliveryTime = new Date(letter.delivery_at)
    
    if (letter.status === 'read') return 'read'
    if (letter.status === 'delivered' && letter.recipient_id === user.id) return 'delivered'
    if (deliveryTime > now) return 'transit'
    if (letter.sender_id === user.id) return 'sent'
    return 'delivered'
  }

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

  const getCounts = () => {
    const now = new Date()
    return {
      all: letters.length,
      received: letters.filter(l => l.recipient_id === user.id && new Date(l.delivery_at) <= now).length,
      sent: letters.filter(l => l.sender_id === user.id && new Date(l.delivery_at) <= now).length,
      transit: letters.filter(l => new Date(l.delivery_at) > now).length,
    }
  }

  const counts = getCounts()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-amber-900 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="font-serif text-xl text-amber-900 italic">Sorting correspondence...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Error Display */}
      {deleteError && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-100 border-2 border-red-800/20 rounded-sm text-red-900 font-body flex items-center gap-3"
        >
          <AlertCircle className="w-5 h-5" />
          <span>{deleteError}</span>
          <button 
            onClick={() => setDeleteError(null)}
            className="ml-auto text-sm underline"
          >
            Dismiss
          </button>
        </motion.div>
      )}

      {/* Elegant Header */}
      <div className="text-center pb-6 border-b-2 border-amber-800/20">
        <h1 className="font-serif text-4xl md:text-5xl text-amber-950 mb-2 font-bold tracking-wide">
          The Post Office
        </h1>
        <p className="font-body text-amber-700 italic">Your personal correspondence chamber</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap justify-center gap-2 md:gap-4">
        <FilterButton active={filter === 'all'} onClick={() => setFilter('all')} label="All Letters" count={counts.all} icon={Inbox} />
        <FilterButton active={filter === 'received'} onClick={() => setFilter('received')} label="Received" count={counts.received} icon={Mail} />
        <FilterButton active={filter === 'sent'} onClick={() => setFilter('sent')} label="Sent" count={counts.sent} icon={Send} />
        <FilterButton active={filter === 'transit'} onClick={() => setFilter('transit')} label="In Transit" count={counts.transit} icon={Clock} />
      </div>

      {/* Letters Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filteredLetters.map((letter) => {
            const status = getLetterStatus(letter)
            const isReceived = letter.recipient_id === user.id
            const canDelete = letter.sender_id === user.id // Only sender can delete
            
            return (
              <motion.div
                key={letter.id}
                layout
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="relative group"
              >
                <div 
                  onClick={() => onOpenLetter(letter)}
                  className="cursor-pointer h-full"
                >
                  <EnvelopeCard letter={letter} status={status} isReceived={isReceived} />
                </div>
                
                {/* Delete Button - Only show for sent letters */}
                {canDelete && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ scale: 1.1 }}
                    onClick={(e) => handleDelete(letter.id, e)}
                    className={`absolute top-3 right-3 p-2 rounded-full shadow-lg transition-all z-20 border-2 ${
                      deleteConfirm === letter.id 
                        ? 'bg-red-900 text-amber-100 border-red-950 scale-110 animate-pulse' 
                        : 'bg-amber-100 text-amber-900 border-amber-800/20 opacity-0 group-hover:opacity-100 hover:bg-red-900 hover:text-amber-100 hover:border-red-950'
                    }`}
                    title={deleteConfirm === letter.id ? 'Click again to burn' : 'Burn letter'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {filteredLetters.length === 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20 bg-gradient-to-b from-amber-50/50 to-transparent rounded-lg border-2 border-dashed border-amber-300/50"
        >
          <Feather className="w-20 h-20 mx-auto text-amber-300 mb-6" />
          <p className="font-serif text-3xl text-amber-800 mb-3">The desk is clear</p>
          <p className="font-body text-amber-600 italic text-lg">No letters await your attention</p>
        </motion.div>
      )}
    </div>
  )
}

function FilterButton({ active, onClick, label, count, icon: Icon }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-3 rounded-sm font-serif transition-all duration-300 border-2 ${
        active 
          ? 'bg-gradient-to-r from-amber-900 to-amber-800 text-amber-50 border-amber-950 shadow-lg transform scale-105' 
          : 'bg-amber-100/80 text-amber-900 border-amber-800/20 hover:bg-amber-200 hover:border-amber-800/40'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span className="hidden sm:inline">{label}</span>
      <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${active ? 'bg-amber-700 text-amber-100' : 'bg-amber-800/20 text-amber-900'}`}>
        {count}
      </span>
    </button>
  )
}

function EnvelopeCard({ letter, status, isReceived }) {
  const waxColors = {
    red: 'from-red-900 via-red-800 to-red-950',
    green: 'from-green-900 via-green-800 to-green-950',
    blue: 'from-blue-950 via-blue-900 to-blue-950',
    gold: 'from-yellow-700 via-yellow-600 to-yellow-800',
  }

  const statusConfig = {
    transit: { color: 'text-amber-800', bg: 'bg-amber-100/80', border: 'border-amber-400', label: 'Traveling', sealOpacity: 'opacity-60', accent: 'amber' },
    delivered: { color: 'text-red-900', bg: 'bg-red-50/90', border: 'border-red-400', label: 'New', sealOpacity: 'opacity-100', accent: 'red' },
    read: { color: 'text-amber-900', bg: 'bg-amber-50/60', border: 'border-amber-300', label: 'Read', sealOpacity: 'opacity-80', accent: 'amber' },
    sent: { color: 'text-amber-800', bg: 'bg-amber-50/40', border: 'border-amber-300', label: 'Sent', sealOpacity: 'opacity-70', accent: 'amber' },
  }

  const config = statusConfig[status]

  return (
    <div className={`
      relative h-full bg-gradient-to-br from-amber-50 via-amber-100/80 to-amber-50 
      rounded-sm shadow-md hover:shadow-2xl transition-all duration-500
      border-2 ${config.border} overflow-hidden
      transform hover:-translate-y-2 hover:scale-[1.02]
      group
    `}>
      {/* Paper texture */}
      <div className="absolute inset-0 opacity-50 pointer-events-none mix-blend-multiply" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.5'/%3E%3C/svg%3E")`
      }}></div>

      <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-black/10 to-transparent pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/5 to-transparent pointer-events-none"></div>

      <div className="relative p-6 flex flex-col h-full">
        <div className="flex justify-between items-start mb-5">
          <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${waxColors[letter.wax_color || 'red']} shadow-xl flex items-center justify-center transform rotate-12 ${config.sealOpacity} ring-4 ring-amber-200/50`}>
            <span className="font-serif text-xl text-amber-100 font-bold drop-shadow-md">
              {isReceived ? letter.sender?.display_name?.[0] : letter.recipient?.display_name?.[0]}
            </span>
          </div>
          
          <div className={`px-3 py-1.5 rounded-sm ${config.bg} ${config.color} border border-current shadow-sm`}>
            <span className="font-serif text-xs font-bold tracking-wider uppercase">{config.label}</span>
          </div>
        </div>

        <div className="mb-4">
          <p className="font-body text-xs text-amber-700/80 uppercase tracking-[0.2em] mb-1">
            {isReceived ? 'From' : 'To'}
          </p>
          <h3 className="font-serif text-2xl text-amber-950 font-bold leading-tight mb-1">
            {isReceived ? letter.sender?.display_name : letter.recipient?.display_name}
          </h3>
          <p className="font-body text-sm text-amber-600/90 italic">
            @{isReceived ? letter.sender?.username : letter.recipient?.username}
          </p>
        </div>

        <div className="flex-grow">
          <div className="w-12 h-0.5 bg-amber-800/20 mb-3"></div>
          <h4 className="font-serif text-lg text-amber-950 leading-snug line-clamp-2 font-semibold">
            {letter.subject}
          </h4>
        </div>

        <div className="mt-6 pt-4 border-t border-amber-800/10 flex items-center justify-between">
          <span className="font-body text-xs text-amber-700/80">
            {format(new Date(letter.created_at), 'MMMM d, yyyy')}
          </span>
          
          {status === 'transit' && (
            <span className="font-body text-xs text-amber-700 flex items-center gap-1 bg-amber-200/50 px-2 py-1 rounded-sm">
              <Clock className="w-3 h-3" />
              En route
            </span>
          )}
        </div>
      </div>

      <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-amber-800/20"></div>
      <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-amber-800/20"></div>
      <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-amber-800/20"></div>
      <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-amber-800/20"></div>
    </div>
  )
}