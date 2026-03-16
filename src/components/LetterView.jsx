import React, { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Clock, Feather, Calendar, MapPin, Flame, X, AlertCircle, Send } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { markLetterRead, supabase } from '../lib/supabase'
import { format } from 'date-fns'

// Simple animation config for performance
const simpleFade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 }
}

export default function LetterView({ letter, onBack }) {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showBurnConfirm, setShowBurnConfirm] = useState(false)
  const [deleteError, setDeleteError] = useState(null)
  
  const isReceived = letter.recipient_id === user.id
  const isSender = letter.sender_id === user.id
  const canDelete = isSender
  const isUnread = letter.status === 'delivered'

  useEffect(() => {
    if (isReceived && isUnread && isOpen) {
      markLetterRead(letter.id)
    }
  }, [isOpen, isReceived, isUnread, letter.id])

  const handleOpen = useCallback(() => {
    if (!isOpen) {
      setIsOpen(true)
    }
  }, [isOpen])

  const handleDelete = useCallback(async () => {
    if (!canDelete) {
      setDeleteError('You can only burn letters you sent')
      return
    }

    setIsDeleting(true)
    
    try {
      const { error } = await supabase
        .from('letters')
        .delete()
        .eq('id', letter.id)
        .eq('sender_id', user.id)

      if (error) throw error
      onBack()
    } catch (err) {
      setDeleteError(err.message)
      setIsDeleting(false)
      setShowBurnConfirm(false)
    }
  }, [canDelete, letter.id, user.id, onBack])

  const waxColors = {
    red: 'bg-red-900',
    green: 'bg-green-900',
    blue: 'bg-blue-900',
    gold: 'bg-yellow-700',
  }

  const now = new Date()
  const deliveryTime = new Date(letter.delivery_at)
  const isInTransit = deliveryTime > now

  // Transit view for both sender and recipient
  if (isInTransit) {
    return (
      <div className="max-w-lg mx-auto px-4">
        <button onClick={onBack} className="mb-4 flex items-center gap-2 text-amber-900 font-serif">
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="bg-amber-100 rounded-lg shadow-xl border-2 border-amber-300 p-8 text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-amber-200 rounded-full flex items-center justify-center">
            {isSender ? <Send className="w-10 h-10 text-amber-800" /> : <Clock className="w-10 h-10 text-amber-800" />}
          </div>

          <h2 className="font-serif text-3xl text-amber-950 mb-4 font-bold">
            {isSender ? 'Dispatched' : 'En Route'}
          </h2>
          
          <p className="font-body text-amber-800 mb-6">
            {isSender ? (
              <>Your letter to <span className="font-bold text-red-900">{letter.recipient?.display_name}</span> is traveling</>
            ) : (
              <>Letter from <span className="font-bold text-red-900">{letter.sender?.display_name}</span> is coming</>
            )}
          </p>
          
          <div className="p-4 bg-amber-50 rounded border-2 border-amber-200 mb-6">
            <p className="font-serif text-sm text-amber-700 uppercase mb-1">
              {isSender ? 'Arrives at recipient' : 'Arrives to you'}
            </p>
            <p className="font-serif text-2xl text-amber-950 font-bold">
              {format(deliveryTime, 'MMM d, h:mm a')}
            </p>
          </div>

          <p className="font-script text-xl text-amber-800">
            {isSender ? '"The waiting is the hardest part"' : '"Patience is a virtue"'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 pb-8">
      {/* Error */}
      {deleteError && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded text-red-800 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {deleteError}
          <button onClick={() => setDeleteError(null)} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <button onClick={onBack} className="flex items-center gap-2 text-amber-900 font-serif">
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Back to Mailbox</span>
        </button>

        {canDelete && (
          <div>
            {showBurnConfirm ? (
              <div className="flex items-center gap-2 bg-red-100 border border-red-300 rounded px-3 py-2">
                <span className="text-red-900 text-sm font-bold">Burn?</span>
                <button onClick={handleDelete} disabled={isDeleting} className="px-3 py-1 bg-red-900 text-amber-100 rounded text-sm">
                  {isDeleting ? '...' : 'Yes'}
                </button>
                <button onClick={() => setShowBurnConfirm(false)} className="text-red-900"><X className="w-4 h-4" /></button>
              </div>
            ) : (
              <button onClick={() => setShowBurnConfirm(true)} className="flex items-center gap-1 px-3 py-2 bg-amber-100 text-amber-900 rounded border border-amber-300 hover:bg-red-100 hover:text-red-900">
                <Flame className="w-4 h-4" />
                <span className="text-sm font-bold">Burn</span>
              </button>
            )}
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.div key="envelope" {...simpleFade} onClick={handleOpen} className="cursor-pointer max-w-md mx-auto">
            <div className="bg-amber-200 rounded-lg shadow-xl border-2 border-amber-300 aspect-[1.5/1] flex flex-col items-center justify-center relative overflow-hidden">
              {/* Simple wax seal - no complex animations */}
              <div className={`w-24 h-24 rounded-full ${waxColors[letter.wax_color || 'red']} shadow-lg flex items-center justify-center border-4 border-white/30`}>
                <span className="font-serif text-4xl text-amber-100 font-bold">
                  {letter.sender?.display_name?.[0]}
                </span>
              </div>

              <div className="mt-6 text-center">
                <p className="font-script text-2xl text-amber-900 mb-1">Click to Open</p>
                <p className="font-body text-xs text-amber-700 uppercase tracking-wider">Break the seal</p>
              </div>

              <div className="absolute bottom-4 left-4 right-4 flex justify-between text-xs">
                <span className="font-serif text-amber-800">{letter.sender?.display_name}</span>
                <span className="font-serif text-amber-800">{format(new Date(letter.created_at), 'MMM d')}</span>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="letter" {...simpleFade} className="bg-amber-50 rounded-lg shadow-xl border border-amber-300">
            <div className="p-6 sm:p-8">
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between mb-6 pb-4 border-b-2 border-amber-800/20 gap-2">
                <div>
                  <p className="text-xs text-amber-600 uppercase mb-1">From</p>
                  <h3 className="font-serif text-2xl text-amber-950 font-bold">{letter.sender?.display_name}</h3>
                  <p className="text-sm text-amber-600">@{letter.sender?.username}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xs text-amber-600 uppercase mb-1">Date</p>
                  <p className="font-serif text-lg text-amber-950">{format(new Date(letter.created_at), 'MMM d, yyyy')}</p>
                </div>
              </div>

              {/* Subject */}
              <h1 className="font-serif text-3xl sm:text-4xl text-amber-950 font-bold mb-6">{letter.subject}</h1>

              {/* Content */}
              <div className="space-y-4">
                {letter.content.split('\n').map((paragraph, idx) => (
                  paragraph.trim() && (
                    <p key={idx} className="font-body text-lg text-amber-950 leading-relaxed">
                      {paragraph}
                    </p>
                  )
                ))}
              </div>

              {/* Signature */}
              <div className="mt-8 pt-6 border-t-2 border-amber-800/20">
                <p className="font-script text-3xl text-amber-900 mb-2">Yours truly,</p>
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full ${waxColors[letter.wax_color || 'red']} flex items-center justify-center`}>
                    <span className="font-serif text-xl text-amber-100 font-bold">{letter.sender?.display_name?.[0]}</span>
                  </div>
                  <p className="font-serif text-xl text-amber-950 font-bold">{letter.sender?.display_name}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}