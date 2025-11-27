import { supabase } from '@/lib/supabaseClient'

export const debugWalletOperations = async (userId: string) => {
  try {
    console.log('Debugging wallet operations for user:', userId);
    
    // 1. Check if user exists
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('User not found:', userError);
      return { success: false, error: 'User not found' };
    }

    console.log('User data:', userData);

    // 2. Check if wallet exists
    const { data: walletData, error: walletError } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (walletError) {
      console.error('Wallet not found:', walletError);
      // Try to create a wallet
      const { error: createError } = await supabase
        .from('wallets')
        .insert([
          {
            user_id: userId,
            allocated: 0,
            company_spent: 0,
            reimbursed: 0,
            balance: 0,
            proof_pending: 0,
          }
        ]);

      if (createError) {
        console.error('Failed to create wallet:', createError);
        return { success: false, error: 'Failed to create wallet' };
      }

      console.log('Wallet created successfully');
      return { success: true, message: 'Wallet created successfully' };
    }

    console.log('Wallet data:', walletData);
    return { success: true, data: { user: userData, wallet: walletData } };
  } catch (error) {
    console.error('Debug wallet operations failed:', error);
    return { success: false, error };
  }
}

export const testReimbursementUpdate = async (userId: string, amount: number) => {
  try {
    console.log('Testing reimbursement update for user:', userId, 'amount:', amount);
    
    // Get current wallet data
    const { data: walletData, error: walletError } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (walletError) {
      console.error('Wallet not found:', walletError);
      return { success: false, error: 'Wallet not found' };
    }

    console.log('Current wallet data:', walletData);

    // Update wallet for reimbursement
    const { error: updateError } = await supabase
      .from('wallets')
      .update({
        reimbursed: walletData.reimbursed + amount,
        balance: walletData.balance - amount,
        updated_at: new Date()
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Failed to update wallet:', updateError);
      return { success: false, error: updateError };
    }

    console.log('Wallet updated successfully');
    return { success: true, message: 'Wallet updated successfully' };
  } catch (error) {
    console.error('Test reimbursement update failed:', error);
    return { success: false, error };
  }
}