import React, { useState } from 'react'
import { User, Feather, Mail, Calendar, Edit2, Check, X, Save, ArrowLeft } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

export default function Profile({ onBack }) {
  const { user, profile, fetchProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [formData, setFormData] = useState({
    display_name: profile?.display_name || '',
    bio: profile?.bio || ''
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: formData.display_name,
          bio: formData.bio,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error

      await fetchProfile(user.id)
      setSuccess('Profile updated successfully')
      setIsEditing(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const waxColors = {
    red: 'from-red-900 via-red-800 to-red-950',
    green: 'from-green-900 via-green-800 to-green-950',
    blue: 'from-blue-950 via-blue-900 to-blue-950',
    gold: 'from-yellow-700 via-yellow-600 to-yellow-800',
  }

  const memberSince = profile?.created_at 
    ? new Date(profile.created_at).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    : 'Unknown'

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 pd-y mauto">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="mb-6 pd-xy md:mb-8 flex items-center gap-3 text-amber-900 hover:text-red-900 transition-colors font-serif group"
      >
        <div className="p-2 bg-amber-100 rounded-full group-hover:bg-red-100 transition-colors border border-amber-300">
          <ArrowLeft className="w-5 h-5" />
        </div>
        <span className="text-lg">Return to Post Office</span>
      </button>

      <div className="bg-amber-50 rounded-sm shadow-2xl border-2 border-amber-800/20 overflow-hidden relative">
        {/* Header Banner */}
        <div className="bg-linear-to-r from-red-900 via-red-800 to-red-900 px-4 md:px-8 py-8 md:py-12 relative">
          {!isMobile && (
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.15'/%3E%3C/svg%3E")`
            }}></div>
          )}
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 pd-xy2">
            {/* Avatar */}
            <div className={`w-24 h-24 md:w-32 md:h-32 rounded-full bg-linear-to-br ${waxColors.red} shadow-2xl flex items-center justify-center border-4 border-amber-200 shrink-0`}>
              <span className="font-serif text-4xl md:text-5xl text-amber-100 font-bold">
                {profile?.display_name?.[0] || user?.email?.[0]?.toUpperCase()}
              </span>
            </div>
            
            <div className="text-center md:text-left">
              <h1 className="font-serif text-3xl disname md:text-5xl text-amber-100 font-bold tracking-wide mb-2">
                {profile?.display_name || 'Correspondent'}
              </h1>
              <p className="font-body text-amber-200 italic text-lg">
                Member of the Slow Letters Society
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 md:p-8 lg:p-12 relative pd-xy2 mr-b">
          {!isMobile && (
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paper'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.04' numOctaves='3' /%3E%3CfeDiffuseLighting lighting-color='%23f8f6f1' surfaceScale='2'%3E%3CfeDistantLight azimuth='45' elevation='60' /%3E%3C/feDiffuseLighting%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23paper)' /%3E%3C/svg%3E")`
            }}></div>
          )}

          {/* Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 border-2 border-red-800/20 rounded-sm flex items-center gap-3 text-red-900 font-body">
              <X className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-100 border-2 border-green-800/20 rounded-sm flex items-center gap-3 text-green-900 font-body">
              <Check className="w-5 h-5 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Edit Button */}
          {!isEditing && (
            <div className="flex justify-end mb-6 mr-b">
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 pd-xy md:px-6 md:py-3 bg-amber-200 text-amber-900 rounded-sm hover:bg-amber-300 transition-colors font-serif border-2 border-amber-800/20 shadow-md"
              >
                <Edit2 className="w-4 h-4 md:w-5 md:h-5" />
                <span className="font-bold">Edit Profile</span>
              </button>
            </div>
          )}

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2 mr-b">
                <label className="font-serif text-sm text-amber-900 uppercase tracking-[0.2em] font-bold flex items-center gap-2">
                  <Feather className="w-4 h-4" />
                  Display Name
                </label>
                <input
                  type="text"
                  name="display_name"
                  value={formData.display_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pd-xy bg-[#fdfbf7] border-2 border-amber-800/20 rounded-sm font-body text-amber-900 focus:outline-none focus:border-amber-800/40 focus:ring-2 focus:ring-amber-100 transition-all shadow-inner"
                  required
                />
              </div>

              <div className="space-y-2 mr-b">
                <label className="font-serif text-sm text-amber-900 uppercase tracking-[0.2em] font-bold">
                  Biography
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Tell us about yourself, your correspondence style..."
                  className="w-full px-4 py-3 pd-xy bg-[#fdfbf7] border-2 border-amber-800/20 rounded-sm font-body text-amber-900 placeholder-amber-400 focus:outline-none focus:border-amber-800/40 focus:ring-2 focus:ring-amber-100 transition-all shadow-inner resize-none"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 pd-xy md:py-4 bg-linear-to-r from-red-900 via-red-800 to-red-900 text-amber-100 font-serif text-lg rounded-sm hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border-2 border-red-950 font-bold tracking-wide"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-amber-100 border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false)
                    setFormData({
                      display_name: profile?.display_name || '',
                      bio: profile?.bio || ''
                    })
                    setError('')
                  }}
                  disabled={loading}
                  className="px-6 py-3 pd-xy md:py-4 bg-amber-200 text-amber-900 font-serif text-lg rounded-sm hover:bg-amber-300 transition-colors border-2 border-amber-800/20 font-bold"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-8">
              {/* Email & Username */}
              <div className="grid md:grid-cols-2 gap-6 mr-b">
                <div className="p-4 pd-xy md:p-6 bg-amber-100/50 rounded-sm border-2 border-amber-800/10">
                  <div className="flex items-center gap-2 text-amber-700 mb-2">
                    <Mail className="w-4 h-4" />
                    <span className="font-body text-xs uppercase tracking-wider font-bold">Email Address</span>
                  </div>
                  <p className="font-body text-amber-900 text-lg">{user?.email}</p>
                </div>

                <div className="p-4 pd-xy md:p-6 bg-amber-100/50 rounded-sm border-2 border-amber-800/10">
                  <div className="flex items-center gap-2 text-amber-700 mb-2">
                    <User className="w-4 h-4" />
                    <span className="font-body text-xs uppercase tracking-wider font-bold">Username</span>
                  </div>
                  <p className="font-body text-amber-900 text-lg">{profile?.username}</p>
                </div>
              </div>

              {/* Bio Section */}
              <div className="p-4 pd-xy md:p-6 bg-amber-100/30 rounded-sm border-2 border-amber-800/10 text-justify mr-b">
                <h3 className="font-serif text-lg text-amber-900 font-bold mb-3 uppercase tracking-wider">Biography</h3>
                <p className="font-body text-amber-800 leading-relaxed italic whitespace-pre-wrap">
                  {profile?.bio || 'No biography written yet. Click edit to add one.'}
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mr-b">
                <div className="text-center p-4 pd-xy bg-amber-100/50 rounded-sm border-2 border-amber-800/10">
                  <p className="font-serif text-2xl md:text-3xl text-red-900 font-bold">0</p>
                  <p className="font-body text-xs text-amber-700 uppercase tracking-wider mt-1">Sent</p>
                </div>
                <div className="text-center p-4 pd-xy bg-amber-100/50 rounded-sm border-2 border-amber-800/10">
                  <p className="font-serif text-2xl md:text-3xl text-red-900 font-bold">0</p>
                  <p className="font-body text-xs text-amber-700 uppercase tracking-wider mt-1">Received</p>
                </div>
                <div className="text-center p-4 pd-xy bg-amber-100/50 rounded-sm border-2 border-amber-800/10">
                  <p className="font-serif text-2xl md:text-3xl text-red-900 font-bold">0</p>
                  <p className="font-body text-xs text-amber-700 uppercase tracking-wider mt-1">In Transit</p>
                </div>
              </div>

               {/* Member Since */}
              <div className="p-4 pd-xy md:p-6 bg-amber-100/50 rounded-sm border-2 border-amber-800/10">
                <div className="flex items-center gap-2 text-amber-700 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span className="font-body text-xs uppercase tracking-wider font-bold">Member Since</span>
                </div>
                <p className="font-body text-amber-900 text-lg">{memberSince}</p>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  )
}