import { supabase } from '@/lib/supabaseClient'

export const testExpenseSubmission = async () => {
  try {
    console.log('Testing expense submission...');
    
    // Test data
    const testExpense = {
      user_id: '1', // Using the first mock user ID
      category: 'Test Category',
      amount: 100.50,
      source: 'company',
      status: 'pending',
      submitted_on: new Date(),
      notes: 'Test expense for debugging'
    };

    // Try to insert the test expense
    const { data, error } = await supabase
      .from('expenses')
      .insert([testExpense])
      .select();

    if (error) {
      console.error('Failed to submit test expense:', error);
      return { success: false, error };
    }

    console.log('Successfully submitted test expense:', data);
    
    // Clean up - delete the test expense
    if (data && data[0]) {
      const { error: deleteError } = await supabase
        .from('expenses')
        .delete()
        .eq('id', data[0].id);

      if (deleteError) {
        console.error('Failed to delete test expense:', deleteError);
      } else {
        console.log('Successfully cleaned up test expense');
      }
    }

    return { success: true, data };
  } catch (error) {
    console.error('Expense submission test failed:', error);
    return { success: false, error };
  }
}