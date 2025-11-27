import { supabase } from '@/lib/supabaseClient'

export const testReimbursementProcess = async (userId: string, expenseAmount: number) => {
  try {
    console.log('Testing reimbursement process...');
    
    // 1. Check current wallet status
    const { data: walletBefore, error: walletError } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (walletError) {
      console.error('Error fetching wallet:', walletError);
      return { success: false, error: walletError };
    }

    console.log('Wallet before reimbursement:', walletBefore);

    // 2. Simulate expense approval
    const reimbursementAmount = expenseAmount;
    
    // 3. Update wallet for reimbursement
    const { error: updateError } = await supabase
      .from('wallets')
      .update({
        reimbursed: walletBefore.reimbursed + reimbursementAmount,
        balance: walletBefore.balance - reimbursementAmount,
        updated_at: new Date()
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error updating wallet:', updateError);
      return { success: false, error: updateError };
    }

    // 4. Check updated wallet status
    const { data: walletAfter, error: walletAfterError } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (walletAfterError) {
      console.error('Error fetching updated wallet:', walletAfterError);
      return { success: false, error: walletAfterError };
    }

    console.log('Wallet after reimbursement:', walletAfter);
    
    // 5. Verify the changes
    const reimbursedIncreased = walletAfter.reimbursed === walletBefore.reimbursed + reimbursementAmount;
    const balanceDecreased = walletAfter.balance === walletBefore.balance - reimbursementAmount;
    
    if (reimbursedIncreased && balanceDecreased) {
      console.log('Reimbursement process test successful!');
      return { success: true, data: { walletBefore, walletAfter } };
    } else {
      console.error('Reimbursement process test failed!');
      return { success: false, error: 'Values not updated correctly' };
    }
  } catch (error) {
    console.error('Reimbursement process test failed:', error);
    return { success: false, error };
  }
}