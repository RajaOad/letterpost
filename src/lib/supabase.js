import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database helper functions
export const getLetters = async (userId) => {
  const { data, error } = await supabase
    .from('letters')
    .select(`
      *,
      sender:profiles!sender_id(username, display_name),
      recipient:profiles!recipient_id(username, display_name)
    `)
    .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export const sendLetter = async (letterData) => {
  const { data, error } = await supabase
    .from('letters')
    .insert([letterData])
    .select()
  
  if (error) throw error
  return data[0]
}

export const markLetterRead = async (letterId) => {
  const { error } = await supabase
    .from('letters')
    .update({ status: 'read', read_at: new Date().toISOString() })
    .eq('id', letterId)
  
  if (error) throw error
}

export const deleteLetter = async (letterId) => {
  const { error } = await supabase
    .from('letters')
    .delete()
    .eq('id', letterId)
  
  if (error) throw error
}

export const findUserByUsername = async (username) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, display_name')
    .eq('username', username)
    .single()
  
  if (error) return null
  return data
}