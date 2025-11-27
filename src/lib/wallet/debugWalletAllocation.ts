import { supabase } from '@/lib/supabaseClient'

export const debugWalletAllocation = async (userId: string, amount: number, purpose: string) => {
  try {
    console.log('Debugging wallet allocation process...');
    console.log('User ID:', userId);
    console.log('Amount:', amount);
    console.log('Purpose:', purpose);
    
    // 1. Check if user exists
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('User not found:', userError);
      return { success: false, error: 'User not found', step: 'user_check' };
    }

    console.log('User data:', userData);

    // 2. Check if wallet exists
    const { data: walletData, error: walletError } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .single();

    console.log('Wallet check result:', { walletData, walletError });

    // 3. Try to create allocation record
    const { data: allocationData, error: allocationError } = await supabase
      .from('wallet_allocations')
      .insert([
        {
          user_id: userId,
          amount: amount,
          purpose: purpose,
          date: new Date(),
        }
      ])
      .select();

    if (allocationError) {
      console.error('Failed to create allocation record:', allocationError);
      return { success: false, error: allocationError, step: 'allocation_record' };
    }

    console.log('Allocation record created:', allocationData);

    // 4. Update or create wallet
    if (walletData) {
      // Update existing wallet
      const newAllocated = walletData.allocated + amount;
      const newBalance = walletData.balance + amount;
      
      const { error: walletUpdateError } = await supabase
        .from('wallets')
        .update({
          allocated: newAllocated,
          balance: newBalance,
          updated_at: new Date()
        })
        .eq('user_id', userId);

      if (walletUpdateError) {
        console.error('Failed to update wallet:', walletUpdateError);
        return { success: false, error: walletUpdateError, step: 'wallet_update' };
      }
      
      console.log(`Wallet updated - allocated: ${newAllocated}, balance: ${newBalance}`);
    } else {
      // Create new wallet
      const { error: walletCreateError } = await supabase
        .from('wallets')
        .insert([
          {
            user_id: userId,
            allocated: amount,
            company_spent: 0,
            reimbursed: 0,
            balance: amount,
            proof_pending: 0,
          }
        ]);

      if (walletCreateError) {
        console.error('Failed to create wallet:', walletCreateError);
        return { success: false, error: walletCreateError, step: 'wallet_create' };
      }
      
      console.log(`New wallet created with allocated: ${amount}, balance: ${amount}`);
    }

    console.log('Wallet allocation successful');
    return { success: true, message: 'Funds allocated successfully' };
  } catch (error) {
    console.error('Debug wallet allocation failed:', error);
    return { success: false, error: (error as Error).message, step: 'exception' };
  }
}

export const testSupabaseConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    
    // Test users table
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('id, name, role')
      .limit(1);

    if (usersError) {
      console.error('Users table error:', usersError);
      return { success: false, error: usersError, table: 'users' };
    }

    console.log('Users table connection successful:', usersData);

    // Test wallets table
    const { data: walletsData, error: walletsError } = await supabase
      .from('wallets')
      .select('user_id, allocated, balance')
      .limit(1);

    if (walletsError) {
      console.error('Wallets table error:', walletsError);
      return { success: false, error: walletsError, table: 'wallets' };
    }

    console.log('Wallets table connection successful:', walletsData);

    // Test wallet_allocations table
    const { data: allocationsData, error: allocationsError } = await supabase
      .from('wallet_allocations')
      .select('user_id, amount, purpose')
      .limit(1);

    if (allocationsError) {
      console.error('Wallet allocations table error:', allocationsError);
      return { success: false, error: allocationsError, table: 'wallet_allocations' };
    }

    console.log('Wallet allocations table connection successful:', allocationsData);

    return { success: true, message: 'All tables accessible' };
  } catch (error) {
    console.error('Connection test failed:', error);
    return { success: false, error: (error as Error).message };
  }
}