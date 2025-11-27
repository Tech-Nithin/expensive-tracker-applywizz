import { supabase } from '@/lib/supabaseClient'

export const testSupabaseConnection = async () => {
  try {
    // Test connection by fetching users table
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1)

    if (error) {
      console.error('Supabase connection test failed:', error)
      return { success: false, error }
    }

    console.log('Supabase connection test successful:', data)
    return { success: true, data }
  } catch (err) {
    console.error('Supabase connection test error:', err)
    return { success: false, error: err }
  }
}