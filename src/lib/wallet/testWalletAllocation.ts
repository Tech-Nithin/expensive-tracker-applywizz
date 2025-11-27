import { supabase } from '@/lib/supabaseClient'

export const testWalletAllocation = async (userId: string, amount: number, purpose: string) => {
  try {
    console.log('Testing wallet allocation for user:', userId, 'amount:', amount);
    
    // 1. Create wallet allocation record
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
      console.error('Error creating allocation record:', allocationError);
      return { success: false, error: allocationError };
    }

    console.log('Allocation record created:', allocationData);

    // 2. Check if user wallet exists
    const { data: walletData, error: walletError } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (walletError) {
      console.error('Wallet not found, creating new wallet:', walletError);
      // Create new wallet
      const { error: createWalletError } = await supabase
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

      if (createWalletError) {
        console.error('Error creating wallet:', createWalletError);
        return { success: false, error: createWalletError };
      }

      console.log('New wallet created successfully');
      return { success: true, message: 'Wallet created and funds allocated' };
    }

    console.log('Existing wallet found:', walletData);

    // 3. Update existing wallet
    const { error: updateError } = await supabase
      .from('wallets')
      .update({
        allocated: walletData.allocated + amount,
        balance: walletData.balance + amount,
        updated_at: new Date()
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error updating wallet:', updateError);
      return { success: false, error: updateError };
    }

    console.log('Wallet updated successfully');
    return { success: true, message: 'Funds allocated successfully' };
  } catch (error) {
    console.error('Test wallet allocation failed:', error);
    return { success: false, error };
  }
}

export const verifyWalletBalance = async (userId: string) => {
  try {
    console.log('Verifying wallet balance for user:', userId);
    
    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching wallet:', error);
      return { success: false, error };
    }

    console.log('Wallet data:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Verify wallet balance failed:', error);
    return { success: false, error };
  }
}