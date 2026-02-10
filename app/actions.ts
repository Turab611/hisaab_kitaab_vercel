'use server';

import { appendTransaction, getTransactions } from '@/lib/google-sheets';
import { revalidatePath } from 'next/cache';

export async function submitTransaction(formData: FormData) {
  const type = formData.get('type') as string;
  const from = formData.get('from') as string;
  const to = formData.get('to') as string;
  const amount = formData.get('amount') as string;
  const description = formData.get('description') as string;
  const date = new Date().toISOString();

  if (!type || !from || !to || !amount) {
    throw new Error('Missing required fields');
  }

  // Schema: Date, Type, From, To, Amount, Description
  const rowData = [
    date,
    type,
    from,
    to,
    amount,
    description || '-'
  ];

  await appendTransaction(rowData);
  revalidatePath('/');
}

export async function fetchDashboardData(accountFilter?: string) {
  const rows = await getTransactions();
  
  // Skip header row if it exists
  const data = rows.slice(1);

  // Initial Balances
  const balances: Record<string, number> = {
    'HBL (Main)': 0,
    'Alfalah (Petty)': 0,
    'Askari (Turab)': 0,
    'Askari (Ali)': 0,
    'Askari (Fahad)': 0,
    'Cash': 0
  };

  // Process transactions chronologically (Oldest first) to calculate running balances
  // Assuming rows are appended chronologically. If date sort is needed, we might need to sort first.
  // Google Sheets usually appends at bottom, so index order is chronological.
  
  const processedTransactions = data.map((row) => {
    const amount = parseFloat(row[4]?.replace(/[^0-9.-]+/g, '')) || 0;
    const from = row[2];
    const to = row[3];
    
    // Debit From
    const fromAccount = Object.keys(balances).find(k => k === from);
    let fromBalance = 0;
    if (fromAccount) {
        balances[fromAccount] -= amount;
        fromBalance = balances[fromAccount];
    }

    // Credit To
    const toAccount = Object.keys(balances).find(k => k === to);
    let toBalance = 0;
    if (toAccount) {
        balances[toAccount] += amount;
        toBalance = balances[toAccount];
    }

    return {
        date: row[0],
        type: row[1],
        from: from,
        to: to,
        amount: amount,
        description: row[5],
        fromBalance: fromAccount ? fromBalance : null,
        toBalance: toAccount ? toBalance : null
    };
  }).reverse(); // Newest first

  let displayedTransactions = processedTransactions;

  if (accountFilter) {
      // Decode if necessary, though basic string match should work
      const decodedFilter = decodeURIComponent(accountFilter);
      displayedTransactions = processedTransactions.filter(t => 
          t.from === decodedFilter || t.to === decodedFilter
      );
  } else {
      // Default view: Limit to recent 20
      displayedTransactions = processedTransactions.slice(0, 20);
  }

  return {
    balances,
    recentTransactions: displayedTransactions
  };
}
