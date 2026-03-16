import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Clock, Feather, Calendar, MapPin, Flame, X, AlertCircle, Send } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { markLetterRead, supabase } from '../lib/supabase'
import { format } from 'date-fns'

const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

export default function LetterView({ letter, onBack }) {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [sealBroken, setSealBroken] = useState(false)
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

  const handleOpen = () => {
    if (!isOpen) {
      setSealBroken(true)
      setTimeout(() => setIsOpen(true), isMobile ? 600 : 1000)
    }
  }

  const handleDelete = async () => {
    if (!canDelete) {
      setDeleteError('You can only burn letters you have sent')
      return
    }

    setIsDeleting(true)
    setDeleteError(null)
    
    try {
      const { data, error } = await supabase
        .from('letters')
        .delete()
        .eq('id', letter.id)
        .eq('sender_id', user.id)
        .select()

      if (error) throw error
      onBack()
    } catch (err) {
      setDeleteError(err.message)
      setIsDeleting(false)
      setShowBurnConfirm(false)
    }
  }

  const waxColors = {
    red: 'from-red-900 via-red-800 to-red-950 shadow-red-900/50',
    green: 'from-green-900 via-green-800 to-green-950 shadow-green-900/50',
    blue: 'from-blue-950 via-blue-900 to-blue-950 shadow-blue-900/50',
    gold: 'from-yellow-700 via-yellow-600 to-yellow-800 shadow-yellow-800/50',
  }

  const now = new Date()
  const deliveryTime = new Date(letter.delivery_at)
  const isInTransit = deliveryTime > now

  if (isInTransit) {
    return (
      <div className="max-w-2xl mx-auto px-4 pb-8">
        <button
          onClick={onBack}
          className="mb-8 flex items-center gap-3 text-amber-900 hover:text-red-900 transition-colors font-serif group"
        >
          <div className="p-2 bg-amber-100 rounded-full group-hover:bg-red-100 transition-colors border border-amber-300">
            <ArrowLeft className="w-5 h-5" />
          </div>
          <span className="text-lg">Return to Post Office</span>
        </button>

        <div className="bg-gradient-to-b from-amber-100 via-amber-50 to-amber-100 rounded-sm shadow-2xl border-4 border-amber-800/20 p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='300' height='300' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`
          }}></div>

          <motion.div
            animate={isMobile ? {} : { y: [0, -20, 0], rotate: [0, 3, -3, 0] }}
            transition={isMobile ? {} : { duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10 mb-10"
          >
            <div className="w-40 h-40 mx-auto relative">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-300 to-amber-400 rounded-lg shadow-2xl transform rotate-6"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-amber-200 to-amber-300 rounded-lg shadow-xl flex items-center justify-center">
                <motion.div animate={isMobile ? {} : { scale: [1, 1.1, 1] }} transition={isMobile ? {} : { duration: 2, repeat: Infinity }}>
                  {isSender ? (
                    <Send className="w-16 h-16 text-amber-800" />
                  ) : (
                    <Clock className="w-16 h-16 text-amber-800" />
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>

          <div className="relative z-10">
            <h2 className="font-serif text-5xl text-amber-950 mb-6 font-bold">
              {isSender ? 'Dispatched' : 'En Route'}
            </h2>
            <p className="font-body text-xl text-amber-800 mb-4 leading-relaxed">
              {isSender ? (
                <>
                  Your letter to <span className="font-serif text-3xl text-red-900 font-bold mx-2">{letter.recipient?.display_name}</span><br/>
                  is journeying to its destination.
                </>
              ) : (
                <>
                  A sealed letter from <span className="font-serif text-3xl text-red-900 font-bold mx-2">{letter.sender?.display_name}</span><br/>
                  is journeying to your estate.
                </>
              )}
            </p>
            
            <div className="my-10 p-8 bg-gradient-to-b from-amber-200/50 to-amber-100/50 rounded-sm border-2 border-amber-800/20 inline-block shadow-inner">
              <div className="flex items-center justify-center gap-3 text-amber-900 mb-3">
                <MapPin className="w-6 h-6" />
                <span className="font-serif text-xl tracking-wider">
                  {isSender ? 'EXPECTED DELIVERY' : 'EXPECTED ARRIVAL'}
                </span>
              </div>
              <p className="font-serif text-4xl text-amber-950 font-bold mb-2">
                {format(deliveryTime, 'MMMM d')}
              </p>
              <p className="font-body text-2xl text-amber-800">
                {format(deliveryTime, 'h:mm a')} • {format(deliveryTime, 'yyyy')}
              </p>
            </div>

            <div className="mt-10 pt-8 border-t-2 border-amber-800/10">
              <p className="font-script text-4xl text-amber-900 mb-3">
                {isSender ? '"The waiting is the hardest part"' : '"Patience is bitter, but its fruit is sweet"'}
              </p>
              <p className="font-body text-amber-700 italic">
                {isSender ? '— Tom Petty' : '— Aristotle'}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto pb-12 px-4">
      {/* Error Message */}
      {deleteError && (
        <motion.div 
          initial={isMobile ? false : { opacity: 0, y: -20 }}
          animate={isMobile ? false : { opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-100 border-2 border-red-800/20 rounded-sm text-red-900 font-body flex items-center gap-3"
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>Error: {deleteError}</span>
          <button onClick={() => setDeleteError(null)} className="ml-auto p-1 hover:bg-red-200 rounded">
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* Header Controls */}
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-3 text-amber-900 hover:text-red-900 transition-colors font-serif group"
        >
          <div className="p-2 bg-amber-100 rounded-full group-hover:bg-red-100 transition-colors border border-amber-300">
            <ArrowLeft className="w-5 h-5" />
          </div>
          <span className="text-lg hidden sm:inline">Return to Post Office</span>
        </button>

        {canDelete && (
          <div className="flex gap-3">
            {showBurnConfirm ? (
              <motion.div 
                initial={isMobile ? false : { scale: 0.8, opacity: 0 }}
                animate={isMobile ? false : { scale: 1, opacity: 1 }}
                className="flex items-center gap-3 bg-red-100 border-2 border-red-800/20 rounded-sm px-4 py-3 shadow-lg"
              >
                <Flame className="w-5 h-5 text-red-800 animate-pulse" />
                <span className="font-body text-red-900 font-bold">Burn this letter?</span>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-900 text-amber-100 rounded-sm font-body text-sm hover:bg-red-950 transition-colors disabled:opacity-50 font-bold"
                >
                  {isDeleting ? 'Burning...' : 'Yes, Burn'}
                </button>
                <button
                  onClick={() => setShowBurnConfirm(false)}
                  disabled={isDeleting}
                  className="p-2 hover:bg-red-200 rounded-full transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5 text-red-800" />
                </button>
              </motion.div>
            ) : (
              <motion.button
                whileHover={isMobile ? {} : { scale: 1.05 }}
                whileTap={isMobile ? {} : { scale: 0.95 }}
                onClick={() => setShowBurnConfirm(true)}
                className="flex items-center gap-2 px-5 py-3 bg-amber-100 text-amber-900 rounded-sm hover:bg-red-100 hover:text-red-900 transition-all font-body border-2 border-amber-800/20 hover:border-red-800/40 shadow-md group"
              >
                <Flame className="w-5 h-5 group-hover:animate-pulse" />
                <span className="font-bold">Burn Letter</span>
              </motion.button>
            )}
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.div
            key="envelope"
            initial={isMobile ? false : { scale: 0.9, opacity: 0 }}
            animate={isMobile ? false : { scale: 1, opacity: 1 }}
            exit={isMobile ? { opacity: 0 } : { scale: 1.1, opacity: 0, rotateY: 15 }}
            className="relative cursor-pointer max-w-2xl mx-auto"
            onClick={handleOpen}
          >
            <div className="bg-gradient-to-br from-amber-200 via-amber-100 to-amber-200 rounded-sm shadow-2xl border-4 border-amber-800/20 aspect-[1.5/1] flex flex-col items-center justify-center relative overflow-hidden group">
              <div className="absolute inset-0 opacity-60" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.5'/%3E%3C/svg%3E")`
              }}></div>

              <div className="absolute top-0 left-0 right-0 h-[60%] bg-gradient-to-b from-amber-300 to-amber-200 transform origin-top shadow-inner"
                   style={{ clipPath: 'polygon(0 0, 50% 100%, 100% 0)' }}></div>

              <div className="absolute bottom-0 left-0 w-1/2 h-[60%] bg-gradient-to-tr from-amber-300 to-amber-200 origin-bottom-left shadow-inner"
                   style={{ clipPath: 'polygon(0 0, 0 100%, 100% 100%)' }}></div>
              <div className="absolute bottom-0 right-0 w-1/2 h-[60%] bg-gradient-to-tl from-amber-300 to-amber-200 origin-bottom-right shadow-inner"
                   style={{ clipPath: 'polygon(100% 0, 0 100%, 100% 100%)' }}></div>

              <div className="absolute top-[60%] left-0 right-0 h-px bg-amber-800/20"></div>

              <motion.div 
                className={`relative z-10 w-32 h-32 rounded-full bg-gradient-to-br ${waxColors[letter.wax_color || 'red']} shadow-2xl flex items-center justify-center border-4 border-white/30`}
                animate={sealBroken ? { 
                  scale: [1, 1.4, 0], 
                  rotate: [0, 15, -15, 0],
                  opacity: [1, 0.9, 0] 
                } : isMobile ? {} : {
                  scale: [1, 1.05, 1],
                  rotate: [0, 3, -3, 0],
                  boxShadow: [
                    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    '0 35px 60px -12px rgba(0, 0, 0, 0.4)',
                    '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                  ]
                }}
                transition={sealBroken ? { duration: 1 } : isMobile ? {} : { duration: 3, repeat: Infinity }}
              >
                <span className="font-serif text-5xl text-amber-100 font-bold drop-shadow-2xl">
                  {letter.sender?.display_name?.[0] || 'S'}
                </span>
              </motion.div>

              <motion.div 
                className="relative z-10 mt-10 text-center"
                animate={sealBroken ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <p className="font-script text-4xl text-amber-900 mb-3">Break the Seal</p>
                <div className="w-16 h-1 bg-amber-800/30 mx-auto mb-3"></div>
                <p className="font-body text-amber-700 text-sm tracking-[0.3em] uppercase">Click to Open</p>
              </motion.div>

              <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end z-10">
                <div className="text-left bg-amber-100/90 backdrop-blur-sm p-3 rounded-sm border border-amber-800/20 shadow-lg">
                  <p className="font-body text-xs text-amber-700 uppercase tracking-wider mb-1">From</p>
                  <p className="font-serif text-lg text-amber-950 font-bold">{letter.sender?.display_name}</p>
                </div>
                <div className="text-right bg-amber-100/90 backdrop-blur-sm p-3 rounded-sm border border-amber-800/20 shadow-lg">
                  <p className="font-body text-xs text-amber-700 uppercase tracking-wider mb-1">Date Penned</p>
                  <p className="font-serif text-lg text-amber-950 font-bold">{format(new Date(letter.created_at), 'MMM d, yyyy')}</p>
                </div>
              </div>

              <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-amber-800/30"></div>
              <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-amber-800/30"></div>
              <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-amber-800/30"></div>
              <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-amber-800/30"></div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="letter"
            initial={isMobile ? false : { opacity: 0, y: 100, rotateX: -15 }}
            animate={isMobile ? false : { opacity: 1, y: 0, rotateX: 0 }}
            transition={isMobile ? {} : { duration: 1, ease: [0.4, 0, 0.2, 1] }}
            style={isMobile ? {} : { perspective: '1000px' }}
          >
            <div className="bg-[#f8f6f1] rounded-sm shadow-2xl border border-amber-900/10 min-h-[800px] relative overflow-hidden">
              <div className="absolute inset-0 opacity-40 pointer-events-none" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paper'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.04' numOctaves='5' /%3E%3CfeDiffuseLighting lighting-color='#f8f6f1' surfaceScale='2'%3E%3CfeDistantLight azimuth='45' elevation='60' /%3E%3C/feDiffuseLighting%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23paper)' /%3E%3C/svg%3E")`
              }}></div>

              <div className="absolute top-32 right-20 w-24 h-24 rounded-full bg-amber-900/5 blur-2xl pointer-events-none"></div>
              <div className="absolute bottom-48 left-16 w-32 h-32 rounded-full bg-amber-800/5 blur-3xl pointer-events-none"></div>
              <div className="absolute top-1/2 right-1/4 w-16 h-16 rounded-full bg-amber-900/3 blur-xl pointer-events-none"></div>

              <div className="relative z-10 p-12 md:p-20">
                <div className="flex justify-between items-start mb-16 pb-8 border-b-2 border-amber-900/20">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-amber-800/70 mb-4">
                      <Feather className="w-5 h-5" />
                      <span className="font-body text-xs uppercase tracking-[0.3em] font-bold">Private Correspondence</span>
                    </div>
                    <div className="space-y-1">
                      <p className="font-body text-sm text-amber-700 italic">From the hand of</p>
                      <h3 className="font-serif text-4xl text-amber-950 font-bold tracking-wide">{letter.sender?.display_name}</h3>
                      <p className="font-body text-amber-600">@{letter.sender?.username}</p>
                    </div>
                  </div>
                  
                  <div className="text-right space-y-3">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100/50 rounded-sm border border-amber-800/20">
                      <Calendar className="w-4 h-4 text-amber-700" />
                      <div>
                        <p className="font-body text-xs text-amber-600 uppercase tracking-wider">Date Composed</p>
                        <p className="font-serif text-lg text-amber-950 font-bold">
                          {format(new Date(letter.created_at), 'MMMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <p className="font-body text-amber-600 text-sm">
                      {format(new Date(letter.created_at), 'h:mm a')}
                    </p>
                  </div>
                </div>

                <div className="mb-12">
                  <p className="font-body text-xs text-amber-600 uppercase tracking-[0.3em] mb-3 font-bold">Regarding</p>
                  <h1 className="font-serif text-5xl md:text-6xl text-amber-950 leading-tight font-bold tracking-tight">
                    {letter.subject}
                  </h1>
                  <div className="w-24 h-1 bg-amber-800/30 mt-6"></div>
                </div>

                <div className="space-y-8 text-justify">
                  {letter.content.split('\n').map((paragraph, idx) => (
                    paragraph.trim() && (
                      <p 
                        key={idx} 
                        className="font-body text-xl text-amber-950 leading-loose first-letter:text-6xl first-letter:font-serif first-letter:float-left first-letter:mr-4 first-letter:mt-[-8px] first-letter:text-red-900"
                        style={{ 
                          textIndent: idx === 0 ? '0' : '2rem',
                        }}
                      >
                        {paragraph}
                      </p>
                    )
                  ))}
                </div>

                <div className="mt-20 pt-12 border-t-2 border-amber-900/10">
                  <p className="font-script text-5xl text-amber-900 mb-6 transform -rotate-2">With warm regards,</p>
                  
                  <div className="flex items-center gap-6 mt-8">
                    <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${waxColors[letter.wax_color || 'red']} flex items-center justify-center shadow-xl transform rotate-12 border-4 border-white/50`}>
                      <span className="font-serif text-3xl text-amber-100 font-bold">
                        {letter.sender?.display_name?.[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-serif text-3xl text-amber-950 font-bold">{letter.sender?.display_name}</p>
                      <p className="font-body text-amber-600 italic mt-1">Correspondent • Slow Letters Society</p>
                    </div>
                  </div>
                </div>

                <div className="mt-16 pt-8 border-t border-amber-900/10 flex justify-between items-center text-xs font-body text-amber-500/60">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-800/30"></div>
                    <span>Sealed with wax • Delivered with care</span>
                  </div>
                  <span className="font-mono tracking-wider">REF: {letter.id.slice(0, 8).toUpperCase()}</span>
                </div>
              </div>

              <div className="absolute top-8 left-8 right-8 bottom-8 border border-amber-900/5 pointer-events-none"></div>
              <div className="absolute top-12 left-12 right-12 bottom-12 border border-amber-900/5 pointer-events-none"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}