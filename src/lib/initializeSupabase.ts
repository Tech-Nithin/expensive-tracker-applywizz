import { supabase } from '@/lib/supabaseClient'
import { mockUsers, mockWallets, mockExpenses, mockCompanyExpenses } from '@/lib/mockData'

export const initializeSupabaseData = async () => {
  try {
    // Check if users already exist
    const { data: existingUsers, error: usersError } = await supabase
      .from('users')
      .select('id')
      .limit(1)

    if (usersError) {
      console.error('Error checking existing users:', usersError)
      return
    }

    // If no users exist, insert mock data
    if (!existingUsers || existingUsers.length === 0) {
      console.log('Initializing Supabase with mock data...')
      
      // Insert users
      const { error: usersInsertError } = await supabase
        .from('users')
        .insert(mockUsers.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar
        })))

      if (usersInsertError) {
        console.error('Error inserting users:', usersInsertError)
        return
      }

      // Insert wallets
      const { error: walletsInsertError } = await supabase
        .from('wallets')
        .insert(mockWallets.map(wallet => ({
          user_id: wallet.userId,
          allocated: wallet.allocated,
          company_spent: wallet.companySpent,
          reimbursed: wallet.reimbursed,
          balance: wallet.balance,
          proof_pending: wallet.proofPending
        })))

      if (walletsInsertError) {
        console.error('Error inserting wallets:', walletsInsertError)
        return
      }

      // Insert expenses
      const { error: expensesInsertError } = await supabase
        .from('expenses')
        .insert(mockExpenses.map(expense => ({
          id: expense.id,
          user_id: expense.userId,
          category: expense.category,
          amount: expense.amount,
          source: expense.source,
          proof_url: expense.proofUrl,
          status: expense.status,
          submitted_on: expense.submittedOn,
          notes: expense.notes,
          rejection_reason: expense.rejectionReason
        })))

      if (expensesInsertError) {
        console.error('Error inserting expenses:', expensesInsertError)
        return
      }

      // Insert company expenses
      const { error: companyExpensesInsertError } = await supabase
        .from('company_expenses')
        .insert(mockCompanyExpenses.map(expense => ({
          id: expense.id,
          type: expense.type,
          vendor: expense.vendor,
          amount: expense.amount,
          date: expense.date,
          payment_ref: expense.paymentRef,
          proof_url: expense.proofUrl,
          notes: expense.notes
        })))

      if (companyExpensesInsertError) {
        console.error('Error inserting company expenses:', companyExpensesInsertError)
        return
      }

      console.log('Supabase initialized with mock data successfully!')
    } else {
      console.log('Supabase already contains data, skipping initialization.')
    }
  } catch (error) {
    console.error('Error initializing Supabase data:', error)
  }
}