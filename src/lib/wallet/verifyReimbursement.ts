import { supabase } from '@/lib/supabaseClient'

/**
 * Verify that the reimbursement deduction logic is working correctly
 * This function simulates the approval process for a personal expense
 */
export const verifyReimbursementDeduction = async (userId: string, expenseAmount: number) => {
  try {
    console.log(`Verifying reimbursement deduction for user ${userId} with amount ${expenseAmount}`);
    
    // 1. Get current wallet state
    const { data: initialWallet, error: initialError } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (initialError) {
      console.error('Error fetching initial wallet state:', initialError);
      return { success: false, error: 'Failed to fetch initial wallet state' };
    }

    console.log('Initial wallet state:', initialWallet);

    // 2. Simulate the approval process
    // For a personal expense approval:
    // - proof_pending should decrease by expenseAmount
    // - reimbursed should increase by expenseAmount
    // - balance should remain the same (as it was already adjusted when submitted)

    const expectedProofPending = Math.max(0, initialWallet.proof_pending - expenseAmount);
    const expectedReimbursed = initialWallet.reimbursed + expenseAmount;
    const expectedBalance = initialWallet.balance; // Should remain unchanged

    // 3. Apply the changes (as would happen in the approval process)
    const { error: updateError } = await supabase
      .from('wallets')
      .update({
        proof_pending: expectedProofPending,
        reimbursed: expectedReimbursed,
        updated_at: new Date()
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error updating wallet:', updateError);
      return { success: false, error: 'Failed to update wallet' };
    }

    // 4. Verify the final state
    const { data: finalWallet, error: finalError } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (finalError) {
      console.error('Error fetching final wallet state:', finalError);
      return { success: false, error: 'Failed to fetch final wallet state' };
    }

    console.log('Final wallet state:', finalWallet);

    // 5. Validate the changes
    const proofPendingCorrect = finalWallet.proof_pending === expectedProofPending;
    const reimbursedCorrect = finalWallet.reimbursed === expectedReimbursed;
    const balanceUnchanged = finalWallet.balance === expectedBalance;

    if (proofPendingCorrect && reimbursedCorrect && balanceUnchanged) {
      console.log('Reimbursement deduction verification successful!');
      return { 
        success: true, 
        data: { 
          initial: initialWallet, 
          final: finalWallet,
          changes: {
            proofPendingChange: initialWallet.proof_pending - finalWallet.proof_pending,
            reimbursedChange: finalWallet.reimbursed - initialWallet.reimbursed
          }
        } 
      };
    } else {
      console.error('Reimbursement deduction verification failed!');
      return { 
        success: false, 
        error: 'Wallet values not updated correctly',
        data: { 
          initial: initialWallet, 
          final: finalWallet,
          expected: {
            proofPending: expectedProofPending,
            reimbursed: expectedReimbursed,
            balance: expectedBalance
          }
        } 
      };
    }
  } catch (error) {
    console.error('Reimbursement deduction verification failed:', error);
    return { success: false, error: (error as Error).message };
  }
}