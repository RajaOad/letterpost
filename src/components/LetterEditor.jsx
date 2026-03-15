import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, Stamp, User, Clock, Feather, AlertCircle, Scroll } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { sendLetter, findUserByUsername } from '../lib/supabase'

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
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-b from-amber-50 via-amber-100/30 to-amber-50 rounded-sm shadow-2xl border-2 border-amber-800/20 overflow-hidden relative"
      >
        {/* Premium texture */}
        <div className="absolute inset-0 opacity-30 pointer-events-none" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.5'/%3E%3C/svg%3E")`
        }}></div>

        {/* Header */}
        <div className="bg-gradient-to-r from-amber-200 via-amber-100 to-amber-200 px-8 py-8 border-b-2 border-amber-800/20 relative">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-900 via-red-800 to-red-950 shadow-2xl flex items-center justify-center border-4 border-amber-200">
              <Scroll className="w-8 h-8 text-amber-100" />
            </div>
            <div>
              <h2 className="font-serif text-4xl text-amber-950 font-bold tracking-wide">Compose Correspondence</h2>
              <p className="font-body text-amber-700 italic text-lg mt-1">"Write something worth waiting for..."</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-10 relative">
          {/* Recipient */}
          <div className="space-y-3">
            <label className="font-serif text-sm text-amber-900 uppercase tracking-[0.2em] font-bold flex items-center gap-2">
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
                className="w-full px-6 py-4 bg-[#fdfbf7] border-2 border-amber-800/20 rounded-sm font-body text-lg text-amber-900 placeholder-amber-400 focus:outline-none focus:border-amber-800/40 focus:ring-4 focus:ring-amber-100 transition-all shadow-inner"
                required
              />
              {foundRecipient && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8, x: 20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  className="absolute right-4 top-4 flex items-center gap-3 bg-green-100 text-green-900 px-4 py-2 rounded-sm border border-green-800/20 shadow-md"
                >
                  <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                  <span className="font-serif font-bold">{foundRecipient.display_name}</span>
                </motion.div>
              )}
            </div>
          </div>

          {/* Subject */}
          <div className="space-y-3">
            <label className="font-serif text-sm text-amber-900 uppercase tracking-[0.2em] font-bold">Subject Matter</label>
            <input
              type="text"
              placeholder="Re: Matters of great importance..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-6 py-4 bg-[#fdfbf7] border-2 border-amber-800/20 rounded-sm font-serif text-2xl text-amber-900 placeholder-amber-400 focus:outline-none focus:border-amber-800/40 focus:ring-4 focus:ring-amber-100 transition-all shadow-inner"
              required
            />
          </div>

          {/* Customization Panel */}
          <div className="grid md:grid-cols-2 gap-8 p-8 bg-amber-100/20 rounded-sm border-2 border-amber-800/10">
            <div className="space-y-4">
              <label className="font-serif text-sm text-amber-900 uppercase tracking-[0.2em] font-bold flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-red-900 to-red-950"></div>
                Wax Seal Color
              </label>
              <div className="flex gap-4">
                {WAX_COLORS.map((color) => (
                  <motion.button
                    key={color.id}
                    type="button"
                    onClick={() => setWaxColor(color.id)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-14 h-14 rounded-full bg-gradient-to-br ${color.class} shadow-xl transition-all border-4 ${
                      waxColor === color.id ? 'border-amber-400 scale-110 ring-4 ring-amber-200' : 'border-white/50 opacity-80 hover:opacity-100'
                    }`}
                    title={color.name}
                  />
                ))}
              </div>
              <p className="font-body text-sm text-amber-700 italic">{WAX_COLORS.find(c => c.id === waxColor)?.name}</p>
            </div>

            <div className="space-y-4">
              <label className="font-serif text-sm text-amber-900 uppercase tracking-[0.2em] font-bold flex items-center gap-2">
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
              <div className="flex justify-between text-sm font-body text-amber-700">
                <span>Immediate</span>
                <span className="font-serif text-amber-950 text-xl font-bold border-b-2 border-amber-800/20 pb-1">
                  Arrives in {getDeliveryLabel(deliveryDelay)}
                </span>
                <span>24 hours</span>
              </div>
            </div>
          </div>

          {/* Letter Content */}
          <div className="space-y-4">
            <label className="font-serif text-sm text-amber-900 uppercase tracking-[0.2em] font-bold flex items-center gap-2">
              <Feather className="w-4 h-4" />
              The Letter
            </label>
            <div className="relative">
              <div className="absolute top-0 left-0 w-full h-12 bg-gradient-to-b from-amber-900/5 to-transparent pointer-events-none rounded-t-sm z-10"></div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="My Dearest Friend,

I take pen in hand to write to you of matters that have weighed upon my mind these past days..."
                rows={16}
                className="w-full px-8 py-8 bg-[#fdfbf7] border-2 border-amber-800/20 rounded-sm font-body text-xl leading-relaxed resize-none focus:outline-none focus:border-amber-800/40 focus:ring-4 focus:ring-amber-100 transition-all shadow-inner text-amber-900 placeholder-amber-300"
                required
                style={{
                  backgroundImage: `repeating-linear-gradient(transparent, transparent 39px, #e5d5b5 39px, #e5d5b5 40px)`,
                  lineHeight: '40px',
                  backgroundAttachment: 'local'
                }}
              />
              <div className="absolute bottom-4 right-6 text-sm font-body text-amber-500 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
                {content.length} characters
              </div>
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-red-50 border-2 border-red-800/20 rounded-sm flex items-center gap-4 text-red-900 font-body shadow-lg"
            >
              <AlertCircle className="w-6 h-6 flex-shrink-0" />
              <p className="text-lg">{error}</p>
            </motion.div>
          )}

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-5 bg-gradient-to-r from-red-900 via-red-800 to-red-900 text-amber-50 font-serif text-2xl rounded-sm shadow-2xl hover:shadow-3xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4 border-2 border-red-950 tracking-wide"
          >
            {loading ? (
              <>
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-3 border-amber-100 border-t-transparent rounded-full"
                />
                <span>Sealing with Wax...</span>
              </>
            ) : (
              <>
                <Stamp className="w-8 h-8" />
                <span>Seal & Dispatch Letter</span>
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  )
}