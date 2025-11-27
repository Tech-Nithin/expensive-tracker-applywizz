import { supabase } from '@/lib/supabaseClient'

export const debugReimbursementProcess = async (expenseId: string, userId: string, amount: number) => {
  try {
    console.log('Debugging reimbursement process...');
    console.log('Expense ID:', expenseId);
    console.log('User ID:', userId);
    console.log('Amount:', amount);
    
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

    if (walletError) {
      console.error('Wallet not found:', walletError);
      return { success: false, error: 'Wallet not found', step: 'wallet_check', walletError };
    }

    console.log('Wallet data:', walletData);

    // 3. Simulate the reimbursement update
    const updatedProofPending = Math.max(0, walletData.proof_pending - amount);
    const updatedReimbursed = walletData.reimbursed + amount;
    
    console.log('Calculated updates:');
    console.log('  New proof_pending:', updatedProofPending);
    console.log('  New reimbursed:', updatedReimbursed);

    // 4. Try to update the wallet
    const { error: updateError } = await supabase
      .from('wallets')
      .update({
        proof_pending: updatedProofPending,
        reimbursed: updatedReimbursed,
        updated_at: new Date()
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Failed to update wallet:', updateError);
      return { success: false, error: 'Failed to update wallet', step: 'wallet_update', updateError };
    }

    console.log('Wallet updated successfully');
    return { success: true, message: 'Reimbursement processed successfully' };
  } catch (error) {
    console.error('Debug reimbursement process failed:', error);
    return { success: false, error: (error as Error).message, step: 'exception' };
  }
}

export const testWalletConnection = async () => {
  try {
    console.log('Testing Supabase connection for wallets...');
    
    // Try a simple query
    const { data, error } = await supabase
      .from('wallets')
      .select('id, user_id, reimbursed, proof_pending')
      .limit(1);

    if (error) {
      console.error('Supabase connection error:', error);
      return { success: false, error };
    }

    console.log('Connection successful. Sample data:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Connection test failed:', error);
    return { success: false, error };
  }
}