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
    from: row[2],
    to: row[3],
    amount: parseFloat(row[4]?.replace(/[^0-9.-]+/g, '')) || 0,
    description: row[5],
  })).reverse(); // Newest first

  transactions.forEach((t) => {
    const amount = t.amount;
    
    if (t.type === 'Income') {
        const account = t.to;
        const normalizedAccount = Object.keys(balances).find(k => k === account) || account;
        if (Object.prototype.hasOwnProperty.call(balances, normalizedAccount)) {
             balances[normalizedAccount] += amount;
        }
    } else if (t.type === 'Outgoing') {
        const account = t.from;
        const normalizedAccount = Object.keys(balances).find(k => k === account) || account;
         if (Object.prototype.hasOwnProperty.call(balances, normalizedAccount)) {
             balances[normalizedAccount] -= amount;
        }
    }
  });

  return {
    balances,
    recentTransactions: transactions.slice(0, 20) // Recent 20
  };
}
