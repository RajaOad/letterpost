import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Send, User, Clock, Feather, AlertCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { sendLetter, findUserByUsername } from '../lib/supabase'

const WAX_COLORS = [
  { id: 'red', name: 'Royal Crimson', class: 'bg-red-900' },
  { id: 'green', name: 'Forest', class: 'bg-green-900' },
  { id: 'blue', name: 'Midnight', class: 'bg-blue-900' },
  { id: 'gold', name: 'Gold', class: 'bg-yellow-700' },
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

  const checkRecipient = useCallback(async (username) => {
    if (!username) return
    const user = await findUserByUsername(username)
    setFoundRecipient(user)
  }, [])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    setError('')

    if (!foundRecipient) {
      setError('Please enter a valid recipient username')
      return
    }

    if (content.length < 10) {
      setError('Your letter is too short')
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
  }, [foundRecipient, content, deliveryDelay, user.id, subject, waxColor, onSent])

  const getDeliveryLabel = (minutes) => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    return `${hours}h`
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-0">
      <div className="bg-amber-50 rounded-lg shadow-xl border-2 border-amber-300 overflow-hidden">
        {/* Header */}
        <div className="bg-amber-200 px-4 sm:px-6 py-4 border-b-2 border-amber-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-900 shadow-lg flex items-center justify-center">
              <Feather className="w-5 h-5 text-amber-100" />
            </div>
            <div>
              <h2 className="font-serif text-2xl text-amber-950 font-bold">Compose</h2>
              <p className="font-body text-xs text-amber-700 italic">Write something meaningful...</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5">
          {/* Recipient */}
          <div className="space-y-1">
            <label className="font-serif text-xs text-amber-800 uppercase font-bold flex items-center gap-1">
              <User className="w-3 h-3" />
              To
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Username..."
                value={recipientUsername}
                onChange={(e) => setRecipientUsername(e.target.value)}
                onBlur={() => checkRecipient(recipientUsername)}
                className="w-full px-3 py-2.5 bg-white border-2 border-amber-300 rounded-md font-body text-amber-900 focus:outline-none focus:border-red-900"
                required
              />
              {foundRecipient && (
                <div className="absolute right-2 top-2 flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                  <span className="font-bold">{foundRecipient.display_name}</span>
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                </div>
              )}
            </div>
          </div>

          {/* Subject */}
          <div className="space-y-1">
            <label className="font-serif text-xs text-amber-800 uppercase font-bold">Subject</label>
            <input
              type="text"
              placeholder="Re:..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border-2 border-amber-300 rounded-md font-serif text-lg text-amber-900 focus:outline-none focus:border-red-900"
              required
            />
          </div>

          {/* Wax Color */}
          <div className="space-y-2">
            <label className="font-serif text-xs text-amber-800 uppercase font-bold">Wax Seal</label>
            <div className="flex gap-2">
              {WAX_COLORS.map((color) => (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => setWaxColor(color.id)}
                  className={`w-8 h-8 rounded-full ${color.class} shadow-md transition-transform ${
                    waxColor === color.id ? 'scale-110 ring-2 ring-amber-400' : 'opacity-70'
                  }`}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Delivery */}
          <div className="space-y-2">
            <label className="font-serif text-xs text-amber-800 uppercase font-bold flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Delivery: {getDeliveryLabel(deliveryDelay)}
            </label>
            <input
              type="range"
              min="1"
              max="1440"
              step="10"
              value={deliveryDelay}
              onChange={(e) => setDeliveryDelay(e.target.value)}
              className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-red-900"
            />
            <div className="flex justify-between text-xs font-body text-amber-600">
              <span>Now</span>
              <span>24h</span>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-1">
            <label className="font-serif text-xs text-amber-800 uppercase font-bold">Your Letter</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Dear friend..."
              rows={10}
              className="w-full px-3 py-3 bg-white border-2 border-amber-300 rounded-md font-body text-base leading-relaxed resize-none focus:outline-none focus:border-red-900"
              required
            />
            <div className="text-right text-xs font-body text-amber-500">
              {content.length} chars
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-100 border border-red-300 rounded text-red-800 font-body text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-red-900 text-amber-100 font-serif text-lg rounded-md hover:bg-red-800 transition-colors disabled:opacity-50"
          >
            {loading ? 'Sealing...' : 'Seal & Send'}
          </button>
        </form>
      </div>
    </div>
  )
}