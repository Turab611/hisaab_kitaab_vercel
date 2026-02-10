'use server';

import { appendTransaction, getTransactions } from '@/lib/google-sheets';
import { revalidatePath } from 'next/cache';

export async function submitTransaction(formData: FormData) {
  const type = formData.get('type') as string;
  const account = formData.get('account') as string;
  const amount = formData.get('amount') as string;
  const category = formData.get('category') as string;
  const notes = formData.get('notes') as string;
  const date = new Date().toISOString();

  if (!type || !account || !amount) {
    throw new Error('Missing required fields');
  }

  const rowData = [
    date,
    type,
    account,
    amount,
    category || '-',
    notes || '-'
  ];

  await appendTransaction(rowData);
  revalidatePath('/');
}

export async function fetchDashboardData() {
  const rows = await getTransactions();
  
  // Skip header row if it exists (assuming first row is headers)
  const data = rows.slice(1);

  // Calculate Balances
  const balances: Record<string, number> = {
    'HBL (Main)': 0,
    'Alfalah (Petty)': 0,
    'Ashari (Turab)': 0,
    'Ashari (Ali)': 0,
    'Ashari (Fahad)': 0,
    'Cash': 0
  };

  // Process transactions
  const transactions = data.map((row) => ({
    date: row[0],
    type: row[1],
    account: row[2],
    amount: parseFloat(row[3]?.replace(/[^0-9.-]+/g, '')) || 0, // Clean currency/text
    category: row[4],
    notes: row[5],
  })).reverse(); // Newest first

  transactions.forEach((t) => {
    const amount = t.amount;
    const account = t.account;
    
    // Normalize account name matching (basic string match)
    const normalizedAccount = Object.keys(balances).find(k => k === account) || account;

    if (!balances[normalizedAccount] && balances[normalizedAccount] !== 0) {
        balances[normalizedAccount] = 0;
    }

    if (t.type === 'Income') {
      balances[normalizedAccount] += amount;
    } else if (t.type === 'Outgoing') {
      balances[normalizedAccount] -= amount;
    }
  });

  return {
    balances,
    recentTransactions: transactions.slice(0, 20) // Recent 20
  };
}
