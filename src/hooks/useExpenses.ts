import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import type { Expense } from '@/types'

export const useExpenses = (userId: string | undefined) => {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch expenses for a specific user
  useEffect(() => {
    if (!userId) return

    const fetchExpenses = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('expenses')
          .select('*')
          .eq('user_id', userId)
          .order('submitted_on', { ascending: false })

        if (error) throw error
        setExpenses(data || [])
      } catch (err: any) {
        setError(err.message)
        console.error('Error fetching expenses:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchExpenses()
  }, [userId])

  // Submit a new expense
  const submitExpense = async (expense: Omit<Expense, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('Submitting expense:', expense);
      
      const { data, error } = await supabase
        .from('expenses')
        .insert([
          {
            user_id: expense.userId,
            category: expense.category,
            amount: expense.amount,
            source: expense.source,
            proof_url: expense.proofUrl,
            status: expense.status,
            submitted_on: expense.submittedOn,
            notes: expense.notes,
          }
        ])
        .select()

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      
      console.log('Expense submitted successfully:', data)
      return data
    } catch (err: any) {
      setError(err.message)
      console.error('Error submitting expense:', err)
      throw err
    }
  }

  // Fetch all expenses for CFO approval dashboard
  const fetchAllExpenses = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('expenses')
        .select(`
          *,
          users (name)
        `)
        .order('submitted_on', { ascending: false })

      if (error) throw error
      
      // Map the data to match the existing Expense type
      const mappedExpenses = data.map(expense => ({
        id: expense.id,
        userId: expense.user_id,
        userName: expense.users?.name || 'Unknown User',
        category: expense.category,
        amount: expense.amount,
        source: expense.source,
        proofUrl: expense.proof_url,
        status: expense.status,
        submittedOn: new Date(expense.submitted_on),
        notes: expense.notes,
        rejectionReason: expense.rejection_reason
      }))
      
      setExpenses(mappedExpenses)
      return mappedExpenses
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching all expenses:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    expenses,
    loading,
    error,
    submitExpense,
    fetchAllExpenses
  }
}