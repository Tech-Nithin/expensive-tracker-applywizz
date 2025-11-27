import { supabase } from '@/lib/supabaseClient'
import { mockUsers } from '@/lib/mockData'

export const testUserIdConversion = async (mockUserId: string) => {
  try {
    console.log('Testing user ID conversion for mock user ID:', mockUserId);
    
    // Find the mock user
    const mockUser = mockUsers.find(u => u.id === mockUserId);
    if (!mockUser) {
      console.error('Mock user not found');
      return { success: false, error: 'Mock user not found' };
    }

    console.log('Mock user found:', mockUser);

    // Find the real user in the database with the same email
    const { data: realUser, error: userError } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('email', mockUser.email)
      .single();
      
    if (userError) {
      console.error('Real user not found:', userError);
      return { success: false, error: userError };
    }

    console.log('Real user found:', realUser);
    
    // Test creating an allocation with the real UUID
    const { data: allocationData, error: allocationError } = await supabase
      .from('wallet_allocations')
      .insert([
        {
          user_id: realUser.id,
          amount: 1000,
          purpose: 'Test allocation',
          date: new Date(),
        }
      ])
      .select();

    if (allocationError) {
      console.error('Failed to create allocation:', allocationError);
      return { success: false, error: allocationError };
    }

    console.log('Allocation created successfully:', allocationData);
    
    // Clean up - delete the test allocation
    if (allocationData && allocationData[0]) {
      const { error: deleteError } = await supabase
        .from('wallet_allocations')
        .delete()
        .eq('id', allocationData[0].id);

      if (deleteError) {
        console.error('Failed to delete test allocation:', deleteError);
      } else {
        console.log('Test allocation cleaned up successfully');
      }
    }

    return { success: true, data: { mockUser, realUser, allocation: allocationData } };
  } catch (error) {
    console.error('Test user ID conversion failed:', error);
    return { success: false, error: (error as Error).message };
  }
}

export const getAllUsersWithIds = async () => {
  try {
    console.log('Fetching all users with their IDs...');
    
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, role');
      
    if (error) {
      console.error('Failed to fetch users:', error);
      return { success: false, error };
    }

    console.log('Users fetched:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Get all users failed:', error);
    return { success: false, error: (error as Error).message };
  }
}