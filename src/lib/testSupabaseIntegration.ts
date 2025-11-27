import { supabase } from '@/lib/supabaseClient'

export const testSupabaseIntegration = async () => {
  try {
    console.log('Testing Supabase integration...');
    
    // Test 1: Check if we can connect to the database
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, email')
      .limit(1);

    if (usersError) {
      console.error('Failed to fetch users:', usersError);
      return { success: false, error: usersError };
    }

    console.log('Successfully connected to Supabase database');
    console.log('Sample user data:', users);

    // Test 2: Check if we can insert a test record
    const testUser = {
      name: 'Test User',
      email: 'test@applywizz.com',
      role: 'cxo'
    };

    const { data: insertedUser, error: insertError } = await supabase
      .from('users')
      .insert([testUser])
      .select()
      .limit(1);

    if (insertError) {
      console.error('Failed to insert test user:', insertError);
      return { success: false, error: insertError };
    }

    console.log('Successfully inserted test user:', insertedUser);

    // Test 3: Clean up - delete the test user
    if (insertedUser && insertedUser[0]) {
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', insertedUser[0].id);

      if (deleteError) {
        console.error('Failed to delete test user:', deleteError);
      } else {
        console.log('Successfully cleaned up test user');
      }
    }

    console.log('All Supabase integration tests passed!');
    return { success: true, data: users };
  } catch (error) {
    console.error('Supabase integration test failed:', error);
    return { success: false, error };
  }
}