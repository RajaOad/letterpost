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
      setTimeout(() => setIsOpen(true), isMobile ? 400 : 800)
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
      <div className="max-w-2xl mx-auto px-4 pb-8 mauto pd-y">
        <button
          onClick={onBack}
          className="mb-6 pd-xy md:mb-8 flex items-center gap-3 text-amber-900 hover:text-red-900 transition-colors font-serif group"
        >
          <div className="p-2 bg-amber-100 rounded-full group-hover:bg-red-100 transition-colors border border-amber-300">
            <ArrowLeft className="w-5 h-5" />
          </div>
          <span className="text-lg">Return to Post Office</span>
        </button>

        <div className="bg-linear-to-b from-amber-100 via-amber-50 to-amber-100 rounded-sm shadow-2xl border-4 border-amber-800/20 p-8 md:p-12 text-center relative overflow-hidden mr-xy">
          {!isMobile && (
            <div className="absolute inset-0 opacity-30" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='300' height='300' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`
            }}></div>
          )}

          <div className="relative z-10 mb-8 md:mb-10">
            <div className="w-32 h-32 md:w-40 md:h-40 mx-auto relative">
              <div className="absolute inset-0 bg-linear-to-br from-amber-300 to-amber-400 rounded-lg shadow-xl transform rotate-6"></div>
              <div className="absolute inset-0 bg-linear-to-br from-amber-200 to-amber-300 rounded-lg shadow-lg flex items-center justify-center">
                {isSender ? (
                  <Send className="w-12 h-12 md:w-16 md:h-16 text-amber-800" />
                ) : (
                  <Clock className="w-12 h-12 md:w-16 md:h-16 text-amber-800" />
                )}
              </div>
            </div>
          </div>

          <div className="relative z-10">
            <h2 className="font-serif text-3xl md:text-5xl text-amber-950 mb-4 md:mb-6 font-bold">
              {isSender ? 'Dispatched' : 'En Route'}
            </h2>
            <p className="font-body text-lg md:text-xl text-amber-800 mb-4 leading-relaxed">
              {isSender ? (
                <>
                  Your letter to <span className="font-serif text-2xl md:text-3xl text-red-900 font-bold mx-1 md:mx-2">{letter.recipient?.display_name}</span><br className="hidden md:block"/>
                  is journeying to its destination.
                </>
              ) : (
                <>
                  A sealed letter from <span className="font-serif text-2xl md:text-3xl text-red-900 font-bold mx-1 md:mx-2">{letter.sender?.display_name}</span><br className="hidden md:block"/>
                  is journeying to your estate.
                </>
              )}
            </p>
            
            <div className="my-6 md:my-10 p-4 md:p-8 bg-linear-to-b from-amber-200/50 to-amber-100/50 rounded-sm border-2 border-amber-800/20 inline-block shadow-inner">
              <div className="flex items-center justify-center gap-2 md:gap-3 text-amber-900 mb-2 md:mb-3">
                <MapPin className="w-5 h-5 md:w-6 md:h-6" />
                <span className="font-serif text-lg md:text-xl tracking-wider">
                  {isSender ? 'EXPECTED DELIVERY' : 'EXPECTED ARRIVAL'}
                </span>
              </div>
              <p className="font-serif text-2xl md:text-4xl text-amber-950 font-bold mb-1 md:mb-2">
                {format(deliveryTime, 'MMMM d')}
              </p>
              <p className="font-body text-lg md:text-2xl text-amber-800">
                {format(deliveryTime, 'h:mm a')} • {format(deliveryTime, 'yyyy')}
              </p>
            </div>

            <div className="mt-6 md:mt-10 pt-6 md:pt-8 border-t-2 border-amber-800/10">
              <p className="font-script text-2xl md:text-4xl text-amber-900 mb-2 md:mb-3">
                {isSender ? '"The waiting is the hardest part"' : '"Patience is bitter, but its fruit is sweet"'}
              </p>
              <p className="font-body text-sm md:text-base text-amber-700 italic">
                {isSender ? '— Tom Petty' : '— Aristotle'}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto pb-12 px-4 mauto">
      {/* Error Message */}
      {deleteError && (
        <div className="mb-6 p-4 bg-red-100 border-2 border-red-800/20 rounded-sm text-red-900 font-body flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>Error: {deleteError}</span>
          <button onClick={() => setDeleteError(null)} className="ml-auto p-1 hover:bg-red-200 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Controls */}
      <div className="flex justify-between items-center mb-6 md:mb-8 pd-xy">
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
              <div className="flex items-center gap-3 bg-red-100 border-2 border-red-800/20 rounded-sm px-4 py-3 shadow-lg">
                <Flame className="w-5 h-5 text-red-800 animate-pulse" />
                <span className="font-body text-red-900 font-bold">Burn?</span>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-900 text-amber-100 rounded-sm font-body text-sm hover:bg-red-950 transition-colors disabled:opacity-50 font-bold"
                >
                  {isDeleting ? 'Burning...' : 'Yes'}
                </button>
                <button
                  onClick={() => setShowBurnConfirm(false)}
                  disabled={isDeleting}
                  className="p-2 hover:bg-red-200 rounded-full transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5 text-red-800" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowBurnConfirm(true)}
                className="flex items-center gap-2 px-5 py-3 bg-amber-100 text-amber-900 rounded-sm hover:bg-red-100 hover:text-red-900 transition-all font-body border-2 border-amber-800/20 hover:border-red-800/40 shadow-md group"
              >
                <Flame className="w-5 h-5" />
                <span className="font-bold">Burn Letter</span>
              </button>
            )}
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.div
            key="envelope"
            initial={isMobile ? false : { scale: 0.95, opacity: 0 }}
            animate={isMobile ? false : { scale: 1, opacity: 1 }}
            exit={isMobile ? { opacity: 0 } : { scale: 1.05, opacity: 0 }}
            transition={isMobile ? {} : { duration: 0.3 }}
            className="relative cursor-pointer max-w-2xl mx-auto pd-xy2 mauto"
            onClick={handleOpen}
          >
            <div className="bg-linear-to-br from-amber-200 via-amber-100 to-amber-200 rounded-sm shadow-2xl border-4 border-amber-800/20 aspect-[1.5/1] flex flex-col items-center justify-center relative overflow-hidden group">
              {!isMobile && (
                <div className="absolute inset-0 opacity-40" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.5'/%3E%3C/svg%3E")`
                }}></div>
              )}

              <div className="absolute top-0 left-0 right-0 h-[60%] bg-linear-to-b from-amber-300 to-amber-200 transform origin-top shadow-inner"
                   style={{ clipPath: 'polygon(0 0, 50% 100%, 100% 0)' }}></div>

              <div className="absolute bottom-0 left-0 w-1/2 h-[60%] bg-linear-to-tr from-amber-300 to-amber-200 origin-bottom-left shadow-inner"
                   style={{ clipPath: 'polygon(0 0, 0 100%, 100% 100%)' }}></div>
              <div className="absolute bottom-0 right-0 w-1/2 h-[60%] bg-linear-to-tl from-amber-300 to-amber-200 origin-bottom-right shadow-inner"
                   style={{ clipPath: 'polygon(100% 0, 0 100%, 100% 100%)' }}></div>

              <div className="absolute top-[60%] left-0 right-0 h-px bg-amber-800/20"></div>

              <div 
                className={`relative z-10 w-28 h-28 md:w-32 md:h-32 rounded-full bg-linear-to-br ${waxColors[letter.wax_color || 'red']} shadow-2xl flex items-center justify-center border-4 border-white/30 transition-all duration-500 ${sealBroken ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
              >
                <span className="font-serif text-4xl md:text-5xl text-amber-100 font-bold drop-shadow-lg">
                  {letter.sender?.display_name?.[0] || 'S'}
                </span>
              </div>

              <div className={`relative z-10 mt-8 md:mt-10 text-center transition-opacity duration-300 ${sealBroken ? 'opacity-0' : 'opacity-100'}`}>
                <p className="font-script text-3xl md:text-4xl text-amber-900 mb-2 md:mb-3">Break the Seal</p>
                <div className="w-12 md:w-16 h-1 bg-amber-800/30 mx-auto mb-2 md:mb-3"></div>
                <p className="font-body text-amber-700 text-xs md:text-sm tracking-[0.2em] uppercase">Click to Open</p>
              </div>

              <div className="absolute bottom-6 md:bottom-8 left-6 md:left-8 right-6 md:right-8 flex justify-between items-end z-10">
                <div className="text-left bg-amber-100/90 backdrop-blur-sm p-2 md:p-3 rounded-sm border border-amber-800/20 shadow-lg">
                  <p className="font-body text-xs text-amber-700 uppercase tracking-wider mb-0.5">From</p>
                  <p className="font-serif text-sm md:text-lg text-amber-950 font-bold">{letter.sender?.display_name}</p>
                </div>
                <div className="text-right bg-amber-100/90 backdrop-blur-sm p-2 md:p-3 rounded-sm border border-amber-800/20 shadow-lg">
                  <p className="font-body text-xs text-amber-700 uppercase tracking-wider mb-0.5">Date Penned</p>
                  <p className="font-serif text-sm md:text-lg text-amber-950 font-bold">{format(new Date(letter.created_at), 'MMM d, yyyy')}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="letter"
            initial={isMobile ? false : { opacity: 0, y: 50 }}
            animate={isMobile ? false : { opacity: 1, y: 0 }}
            transition={isMobile ? {} : { duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className='pd-y'
          >
            <div className="bg-[#f8f6f1] rounded-sm shadow-2xl border border-amber-900/10 min-h-[600px] md:min-h-[800px] relative overflow-hidden pd-xy2">
              {!isMobile && (
                <div className="absolute inset-0 opacity-30 pointer-events-none" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paper'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.04' numOctaves='3' /%3E%3CfeDiffuseLighting lighting-color='#f8f6f1' surfaceScale='2'%3E%3CfeDistantLight azimuth='45' elevation='60' /%3E%3C/feDiffuseLighting%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23paper)' /%3E%3C/svg%3E")`
                }}></div>
              )}

              <div className="absolute top-24 md:top-32 right-16 md:right-20 w-16 h-16 md:w-24 md:h-24 rounded-full bg-amber-900/5 blur-2xl pointer-events-none"></div>
              <div className="absolute bottom-32 md:bottom-48 left-12 md:left-16 w-24 h-24 md:w-32 md:h-32 rounded-full bg-amber-800/5 blur-3xl pointer-events-none"></div>

              <div className="relative z-10 p-6 md:p-12 lg:p-20">
                <div className="flex flex-col md:flex-row justify-between items-start mb-8 md:mb-16 pb-6 md:pb-8 border-b-2 border-amber-900/20 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 md:gap-3 text-amber-800/70 mb-2 md:mb-4">
                      <Feather className="w-4 h-4 md:w-5 md:h-5" />
                      <span className="font-body text-xs uppercase tracking-[0.2em] font-bold">Private Correspondence</span>
                    </div>
                    <div className="space-y-1">
                      <p className="font-body text-xs md:text-sm text-amber-700 italic">From the hand of</p>
                      <h3 className="font-serif text-2xl md:text-4xl text-amber-950 font-bold tracking-wide">{letter.sender?.display_name}</h3>
                      <p className="font-body text-amber-600 text-sm">@{letter.sender?.username}</p>
                    </div>
                  </div>
                  
                  <div className="text-left md:text-right space-y-2 md:space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 md:px-4 py-2 bg-amber-100/50 rounded-sm border border-amber-800/20">
                      <Calendar className="w-4 h-4 text-amber-700" />
                      <div>
                        <p className="font-body text-xs text-amber-600 uppercase tracking-wider">Date Composed</p>
                        <p className="font-serif text-base md:text-lg text-amber-950 font-bold">
                          {format(new Date(letter.created_at), 'MMMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <p className="font-body text-amber-600 text-xs md:text-sm">
                      {format(new Date(letter.created_at), 'h:mm a')}
                    </p>
                  </div>
                </div>

                <div className="mb-8 md:mb-12">
                  <p className="font-body text-xs text-amber-600 uppercase tracking-[0.2em] mb-2 md:mb-3 font-bold">Regarding</p>
                  <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl text-amber-950 leading-tight font-bold tracking-tight">
                    {letter.subject}
                  </h1>
                  <div className="w-16 md:w-24 h-1 bg-amber-800/30 mt-4 md:mt-6"></div>
                </div>

                {/* CLEAN LETTER CONTENT - No drop caps, consistent spacing */}
                <div className="space-y-6 md:space-y-8 pd-xy2">
                  {letter.content.split('\n').map((paragraph, idx) => (
                    paragraph.trim() && (
                      <p 
                        key={idx} 
                        className="font-body text-base md:text-xl text-amber-950 leading-relaxed text-justify"
                        style={{ 
                          textIndent: '0',
                          marginBottom: '1.5rem',
                          lineHeight: '1.8'
                        }}
                      >
                        {paragraph}
                      </p>
                    )
                  ))}
                </div>

                <div className="mt-12 md:mt-20 pt-8 md:pt-12 border-t-2 border-amber-900/10">
                  <p className="font-script text-3xl md:text-5xl text-amber-900 mb-4 md:mb-6 transform -rotate-2">With warm regards,</p>
                  
                  <div className="flex items-center gap-4 md:gap-6 mt-6 md:mt-8">
                    <div className={`w-14 h-14 md:w-20 md:h-20 rounded-full bg-linear-to-br ${waxColors[letter.wax_color || 'red']} flex items-center justify-center shadow-xl transform rotate-12 border-4 border-white/50`}>
                      <span className="font-serif text-xl md:text-3xl text-amber-100 font-bold">
                        {letter.sender?.display_name?.[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-serif text-xl md:text-3xl text-amber-950 font-bold">{letter.sender?.display_name}</p>
                      <p className="font-body text-amber-600 italic mt-1 text-sm md:text-base">Correspondent • Slow Letters Society</p>
                    </div>
                  </div>
                </div>

                <div className="mt-12 md:mt-16 pt-6 md:pt-8 border-t border-amber-900/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-2 text-xs font-body text-amber-500/60">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-800/30"></div>
                    <span>Sealed with wax • Delivered with care</span>
                  </div>
                  <span className="font-mono tracking-wider">REF: {letter.id.slice(0, 8).toUpperCase()}</span>
                </div>
              </div>

              {!isMobile && (
                <>
                  <div className="absolute top-8 left-8 right-8 bottom-8 border border-amber-900/5 pointer-events-none"></div>
                  <div className="absolute top-12 left-12 right-12 bottom-12 border border-amber-900/5 pointer-events-none"></div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}