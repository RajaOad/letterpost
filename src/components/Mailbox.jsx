import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Send, Mail, Inbox, Feather, AlertCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { getLetters, supabase } from '../lib/supabase'
import { format } from 'date-fns'

const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

export default function Mailbox({ onOpenLetter }) {
  const { user } = useAuth()
  const [letters, setLetters] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [deleteError, setDeleteError] = useState(null)

  useEffect(() => {
    fetchLetters()
    
    const subscription = supabase
      .channel('letters')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'letters' },
        () => fetchLetters()
      )
      .subscribe()

    return () => subscription.unsubscribe()
  }, [user])

  const fetchLetters = async () => {
    try {
      const data = await getLetters(user.id)
      setLetters(data)
    } catch (error) {
      console.error('Error fetching letters:', error)
    } finally {
      setLoading(false)
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
      <div className="flex items-center justify-center h-64 md:h-96 px-4">
        <div className="text-center">
          <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-amber-900 border-t-transparent rounded-full mx-auto mb-4 animate-spin" />
          <p className="font-serif text-lg md:text-xl text-amber-900 italic">Sorting correspondence...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 md:space-y-8 w-full px-4 sm:px-6 lg:px-8">
      {/* Error Display */}
      {deleteError && (
        <div className="p-3 md:p-4 bg-red-100 border-2 border-red-800/20 rounded-sm text-red-900 font-body flex items-center gap-2 md:gap-3">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm md:text-base">{deleteError}</span>
          <button onClick={() => setDeleteError(null)} className="ml-auto text-xs md:text-sm underline">Dismiss</button>
        </div>
      )}

      {/* Elegant Header */}
      <div className="text-center pb-4 md:pb-6 border-b-2 border-amber-800/20">
        <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl text-amber-950 mb-2 font-bold tracking-wide">
          The Post Office
        </h1>
        <p className="font-body text-amber-700 italic text-sm md:text-base">Your personal correspondence chamber</p>
      </div>

      {/* Filter Tabs - Scrollable on mobile */}
      <div className="flex flex-nowrap justify-center md:justify-center gap-2 overflow-x-auto pb-2 scrollbar-hide pd-xy mr-sm">
        <FilterButton active={filter === 'all'} onClick={() => setFilter('all')} label="All" count={counts.all} icon={Inbox} />
        <FilterButton active={filter === 'received'} onClick={() => setFilter('received')} label="Received" count={counts.received} icon={Mail} />
        <FilterButton active={filter === 'sent'} onClick={() => setFilter('sent')} label="Sent" count={counts.sent} icon={Send} />
        <FilterButton active={filter === 'transit'} onClick={() => setFilter('transit')} label="Transit" count={counts.transit} icon={Clock} />
      </div>

      {/* Letters Grid */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 pb-8 pd-x mr-b">
        {filteredLetters.map((letter) => {
          const status = getLetterStatus(letter)
          const isReceived = letter.recipient_id === user.id
          
          return (
            <div
              key={letter.id}
              onClick={() => onOpenLetter(letter)}
              className="cursor-pointer h-full"
            >
              <EnvelopeCard letter={letter} status={status} isReceived={isReceived} />
            </div>
          )
        })}
      </div>

      {filteredLetters.length === 0 && (
        <div className="text-center py-12 md:py-20 bg-amber-50/50 rounded-lg border-2 border-dashed border-amber-300/50 mx-2 sm:mx-0">
          <Feather className="w-16 h-16 md:w-20 md:h-20 mx-auto text-amber-300 mb-4 md:mb-6" />
          <p className="font-serif text-2xl md:text-3xl text-amber-800 mb-2 md:mb-3">The desk is clear</p>
          <p className="font-body text-amber-600 italic text-base md:text-lg">No letters await your attention</p>
        </div>
      )}
    </div>
  )
}

function FilterButton({ active, onClick, label, count, icon: Icon }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-6 py-2 md:py-3 rounded-sm font-serif transition-all duration-300 border-2 text-sm md:text-base whitespace-nowrap shrink-0 ${
        active 
          ? 'bg-linear-to-r from-amber-900 to-amber-800 text-amber-50 border-amber-950 shadow-lg' 
          : 'bg-amber-100/80 text-amber-900 border-amber-800/20 hover:bg-amber-200 hover:border-amber-800/40'
      }`}
    >
      <Icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
      <span>{label}</span>
      <span className={`ml-1 md:ml-2 text-xs px-1.5 md:px-2 py-0.5 rounded-full ${active ? 'bg-amber-700 text-amber-100' : 'bg-amber-800/20 text-amber-900'}`}>
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
    transit: { color: 'text-amber-800', bg: 'bg-amber-100/80', border: 'border-amber-400', label: 'Traveling', sealOpacity: 'opacity-60' },
    delivered: { color: 'text-red-900', bg: 'bg-red-50/90', border: 'border-red-400', label: 'New', sealOpacity: 'opacity-100' },
    read: { color: 'text-amber-900', bg: 'bg-amber-50/60', border: 'border-amber-300', label: 'Read', sealOpacity: 'opacity-80' },
    sent: { color: 'text-amber-800', bg: 'bg-amber-50/40', border: 'border-amber-300', label: 'Sent', sealOpacity: 'opacity-70' },
  }

  const config = statusConfig[status]

  return (
    <div className={`
      relative h-full bg-linear-to-br from-amber-50 via-amber-100/80 to-amber-50 
      rounded-sm shadow-md hover:shadow-xl transition-shadow duration-200
      border-2 ${config.border} overflow-hidden
    `}>
      {/* Gradient overlays */}
      <div className="absolute top-0 left-0 right-0 h-10 md:h-12 bg-linear-to-b from-black/5 to-transparent pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 right-0 h-10 md:h-12 bg-linear-to-t from-black/5 to-transparent pointer-events-none"></div>

      <div className="relative p-4 md:p-6 flex flex-col h-full">
        <div className="flex justify-between items-start mb-4 md:mb-5">
          <div className={`w-10 h-10 md:w-14 md:h-14 rounded-full bg-linear-to-br ${waxColors[letter.wax_color || 'red']} shadow-lg flex items-center justify-center transform rotate-12 ${config.sealOpacity} ring-2 md:ring-4 ring-amber-200/50`}>
            <span className="font-serif text-base md:text-xl text-amber-100 font-bold">
              {isReceived ? letter.sender?.display_name?.[0] : letter.recipient?.display_name?.[0]}
            </span>
          </div>
          
          <div className={`px-2 md:px-3 py-1 md:py-1.5 rounded-sm ${config.bg} ${config.color} border border-current shadow-sm`}>
            <span className="font-serif text-xs font-bold tracking-wider uppercase">{config.label}</span>
          </div>
        </div>

        <div className="mb-3 md:mb-4">
          <p className="font-body text-xs text-amber-700/80 uppercase tracking-[0.2em] mb-0.5 md:mb-1">
            {isReceived ? 'From' : 'To'}
          </p>
          <h3 className="font-serif text-lg md:text-2xl text-amber-950 font-bold leading-tight mb-0.5 md:mb-1">
            {isReceived ? letter.sender?.display_name : letter.recipient?.display_name}
          </h3>
          <p className="font-body text-xs md:text-sm text-amber-600/90 italic">
            @{isReceived ? letter.sender?.username : letter.recipient?.username}
          </p>
        </div>

        <div className="grow">
          <div className="w-8 md:w-12 h-0.5 bg-amber-800/20 mb-2 md:mb-3"></div>
          <h4 className="font-serif text-base md:text-lg text-amber-950 leading-snug line-clamp-2 font-semibold">
            {letter.subject}
          </h4>
        </div>

        <div className="mt-4 md:mt-6 pt-3 md:pt-4 border-t border-amber-800/10 flex items-center justify-between">
          <span className="font-body text-xs text-amber-700/80">
            {format(new Date(letter.created_at), 'MMM d, yyyy')}
          </span>
          
          {status === 'transit' && (
            <span className="font-body text-xs text-amber-700 flex items-center gap-1 bg-amber-200/50 px-2 py-1 rounded-sm">
              <Clock className="w-3 h-3" />
              En route
            </span>
          )}
        </div>
      </div>
    </div>
  )
}