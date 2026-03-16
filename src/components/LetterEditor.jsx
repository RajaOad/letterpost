import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, Stamp, User, Clock, Feather, AlertCircle, Scroll } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { sendLetter, findUserByUsername } from '../lib/supabase'

const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

const WAX_COLORS = [
  { id: 'red', name: 'Royal Crimson', class: 'from-red-900 via-red-800 to-red-950' },
  { id: 'green', name: 'Forest Green', class: 'from-green-900 via-green-800 to-green-950' },
  { id: 'blue', name: 'Midnight Blue', class: 'from-blue-950 via-blue-900 to-blue-950' },
  { id: 'gold', name: 'Antique Gold', class: 'from-yellow-700 via-yellow-600 to-yellow-800' },
]

export default function LetterEditor({ onSent }) {
  const { user, profile } = useAuth()
  const [recipientUsername, setRecipientUsername] = useState('')
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [waxColor, setWaxColor] = useState('red')
  const [deliveryDelay, setDeliveryDelay] = useState(60)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [foundRecipient, setFoundRecipient] = useState(null)

  const checkRecipient = async (username) => {
    if (!username) return
    const user = await findUserByUsername(username)
    setFoundRecipient(user)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!foundRecipient) {
      setError('Please enter a valid recipient username')
      return
    }

    if (content.length < 10) {
      setError('Your letter is too brief. Take time to compose something meaningful.')
      return
    }

    setLoading(true)

    try {
      const deliveryAt = new Date()
      deliveryAt.setMinutes(deliveryAt.getMinutes() + parseInt(deliveryDelay))

      await sendLetter({
        sender_id: user.id,
        recipient_id: foundRecipient.id,
        subject,
        content,
        wax_color: waxColor,
        status: 'in_transit',
        delivery_at: deliveryAt.toISOString(),
        preview: content.substring(0, 150),
      })

      onSent()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getDeliveryLabel = (minutes) => {
    if (minutes < 60) return `${minutes} minutes`
    const hours = Math.floor(minutes / 60)
    return `${hours} hour${hours > 1 ? 's' : ''}`
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div 
        initial={isMobile ? false : { opacity: 0, y: 30 }}
        animate={isMobile ? false : { opacity: 1, y: 0 }}
        className="bg-amber-50 rounded-sm shadow-2xl border-2 border-amber-800/20 overflow-hidden relative"
      >
        {/* Texture only on desktop */}
        {!isMobile && (
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.5'/%3E%3C/svg%3E")`
          }}></div>
        )}

        <div className="bg-linear-to-r from-amber-200 via-amber-100 to-amber-200 px-4 md:px-8 py-6 md:py-8 border-b-2 border-amber-800/20 relative">
          <div className="flex items-center gap-3 md:gap-5">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-linear-to-br from-red-900 via-red-800 to-red-950 shadow-2xl flex items-center justify-center border-4 border-amber-200 shrink-0">
              <Scroll className="w-6 h-6 md:w-8 md:h-8 text-amber-100" />
            </div>
            <div>
              <h2 className="font-serif text-2xl md:text-4xl text-amber-950 font-bold tracking-wide">Compose Correspondence</h2>
              <p className="font-body text-amber-700 italic text-sm md:text-lg mt-1 hidden sm:block">"Write something worth waiting for..."</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-8 lg:p-12 space-y-6 md:space-y-10 relative">
          <div className="space-y-3">
            <label className="font-serif text-xs md:text-sm text-amber-900 uppercase tracking-[0.2em] font-bold flex items-center gap-2">
              <User className="w-4 h-4" />
              Addressee
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Enter recipient's username..."
                value={recipientUsername}
                onChange={(e) => setRecipientUsername(e.target.value)}
                onBlur={() => checkRecipient(recipientUsername)}
                className="w-full px-4 md:px-6 py-3 md:py-4 bg-[#fdfbf7] border-2 border-amber-800/20 rounded-sm font-body text-base md:text-lg text-amber-900 placeholder-amber-400 focus:outline-none focus:border-amber-800/40 focus:ring-4 focus:ring-amber-100 transition-all shadow-inner"
                required
              />
              {foundRecipient && (
                <div className="absolute right-2 md:right-4 top-2.5 md:top-4 flex items-center gap-2 md:gap-3 bg-green-100 text-green-900 px-3 md:px-4 py-1.5 md:py-2 rounded-sm border border-green-800/20 shadow-md text-sm md:text-base">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="font-serif font-bold">{foundRecipient.display_name}</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <label className="font-serif text-xs md:text-sm text-amber-900 uppercase tracking-[0.2em] font-bold">Subject Matter</label>
            <input
              type="text"
              placeholder="Re: Matters of great importance..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 md:px-6 py-3 md:py-4 bg-[#fdfbf7] border-2 border-amber-800/20 rounded-sm font-serif text-xl md:text-2xl text-amber-900 placeholder-amber-400 focus:outline-none focus:border-amber-800/40 focus:ring-4 focus:ring-amber-100 transition-all shadow-inner"
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4 md:gap-8 p-4 md:p-8 bg-amber-100/20 rounded-sm border-2 border-amber-800/10">
            <div className="space-y-4">
              <label className="font-serif text-xs md:text-sm text-amber-900 uppercase tracking-[0.2em] font-bold flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-linear-to-br from-red-900 to-red-950"></div>
                Wax Seal Color
              </label>
              <div className="flex gap-3 md:gap-4">
                {WAX_COLORS.map((color) => (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => setWaxColor(color.id)}
                    className={`w-10 h-10 md:w-14 md:h-14 rounded-full bg-linear-to-br ${color.class} shadow-xl transition-all border-4 ${
                      waxColor === color.id ? 'border-amber-400 scale-110 ring-4 ring-amber-200' : 'border-white/50 opacity-80 hover:opacity-100'
                    }`}
                    title={color.name}
                  />
                ))}
              </div>
              <p className="font-body text-xs md:text-sm text-amber-700 italic">{WAX_COLORS.find(c => c.id === waxColor)?.name}</p>
            </div>

            <div className="space-y-4">
              <label className="font-serif text-xs md:text-sm text-amber-900 uppercase tracking-[0.2em] font-bold flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Delivery Schedule
              </label>
              <input
                type="range"
                min="1"
                max="1440"
                step="10"
                value={deliveryDelay}
                onChange={(e) => setDeliveryDelay(e.target.value)}
                className="w-full h-3 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-red-900"
              />
              <div className="flex justify-between text-xs md:text-sm font-body text-amber-700">
                <span>Immediate</span>
                <span className="font-serif text-amber-950 text-lg md:text-xl font-bold border-b-2 border-amber-800/20 pb-1">
                  Arrives in {getDeliveryLabel(deliveryDelay)}
                </span>
                <span>24 hours</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="font-serif text-xs md:text-sm text-amber-900 uppercase tracking-[0.2em] font-bold flex items-center gap-2">
              <Feather className="w-4 h-4" />
              The Letter
            </label>
            <div className="relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="My Dearest Friend,

I take pen in hand to write to you of matters that have weighed upon my mind these past days..."
                rows={isMobile ? 12 : 16}
                className="w-full px-4 md:px-8 py-4 md:py-8 bg-[#fdfbf7] border-2 border-amber-800/20 rounded-sm font-body text-base md:text-xl leading-relaxed resize-none focus:outline-none focus:border-amber-800/40 focus:ring-4 focus:ring-amber-100 transition-all shadow-inner text-amber-900 placeholder-amber-300"
                required
                style={{
                  backgroundImage: `repeating-linear-gradient(transparent, transparent ${isMobile ? '31px' : '39px'}, #e5d5b5 ${isMobile ? '31px' : '39px'}, #e5d5b5 ${isMobile ? '32px' : '40px'})`,
                  lineHeight: isMobile ? '32px' : '40px',
                  backgroundAttachment: 'local'
                }}
              />
              <div className="absolute bottom-4 right-4 md:right-6 text-xs md:text-sm font-body text-amber-500 bg-amber-100 px-2 md:px-3 py-1 rounded-full border border-amber-200">
                {content.length} chars
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 md:p-6 bg-red-100 border-2 border-red-800/20 rounded-sm flex items-center gap-3 md:gap-4 text-red-900 font-body shadow-lg">
              <AlertCircle className="w-5 h-5 md:w-6 md:h-6 shrink-0" />
              <p className="text-sm md:text-lg">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 md:py-5 bg-linear-to-r from-red-900 via-red-800 to-red-900 text-amber-50 font-serif text-xl md:text-2xl rounded-sm shadow-2xl hover:shadow-3xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 md:gap-4 border-2 border-red-950 tracking-wide active:scale-95"
          >
            {loading ? (
              <>
                <div className="w-6 h-6 md:w-8 md:h-8 border-3 border-amber-100 border-t-transparent rounded-full animate-spin" />
                <span>Sealing...</span>
              </>
            ) : (
              <>
                <Stamp className="w-6 h-6 md:w-8 md:h-8" />
                <span>Seal & Dispatch</span>
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  )
}