import { supabase } from '@/lib/supabaseClient'

export const debugSupabaseConnection = async () => {
  try {
    console.log('Debugging Supabase connection...');
    
    // Check if we can connect to the database
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email')
      .limit(1);

    if (error) {
      console.error('Supabase connection error:', error);
      return { success: false, error };
    }

    console.log('Supabase connection successful. Sample data:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    return { success: false, error };
  }
}

export const debugExpenseTable = async () => {
  try {
    console.log('Debugging expenses table...');
    
    // Check table structure
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Expenses table access error:', error);
      return { success: false, error };
    }

    console.log('Expenses table access successful. Sample data:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Expenses table test failed:', error);
    return { success: false, error };
  }
}