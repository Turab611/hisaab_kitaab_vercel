'use server';

import { appendTransaction, getTransactions } from '@/lib/google-sheets';
import { revalidatePath } from 'next/cache';

export async function submitTransaction(formData: FormData) {
  const type = formData.get('type') as string;
  const from = formData.get('from') as string;
  const to = formData.get('to') as string;
  const amountVal = formData.get('amount') as string;
  const description = formData.get('description') as string;
  const date = new Date().toISOString();

  if (!type || !from || !to || !amountVal) {
    throw new Error('Missing required fields');
  }
  
  const amount = parseFloat(amountVal);

  // 1. Fetch current final balances to calculate the new running balance
  const { balances } = await fetchDashboardData();
  
  let newFromBal: string | number = '-';
  let newToBal: string | number = '-';

  // Calculate new From Balance
  // Check if 'from' is one of our tracked accounts
  if (Object.prototype.hasOwnProperty.call(balances, from)) {
    newFromBal = balances[from] - amount;
  }

  // Calculate new To Balance
  // Check if 'to' is one of our tracked accounts
  if (Object.prototype.hasOwnProperty.call(balances, to)) {
    newToBal = balances[to] + amount;
  }

  // Schema: Date, Type, From, To, Amount, Description, FromBalance, ToBalance
  const rowData = [
    date,
    type,
    from,
    to,
    amountVal,
    description || '-',
    newFromBal.toString(),
    newToBal.toString()
  ];

  await appendTransaction(rowData);
  revalidatePath('/');
}

export async function fetchDashboardData(accountFilter?: string) {
  const rows = await getTransactions();
  
  // Skip header row if it exists
  const data = rows.slice(1);

  // Initial Balances for Calculation
  const balances: Record<string, number> = {
    'HBL (Main)': 0,
    'Alfalah (Petty)': 0,
    'Askari (Turab)': 0,
    'Askari (Ali)': 0,
    'Askari (Fahad)': 0,
    'Cash': 0
  };

  // Process transactions chronologically
  const processedTransactions = data.map((row) => {
    const amount = parseFloat(row[4]?.replace(/[^0-9.-]+/g, '')) || 0;
    const from = row[2];
    const to = row[3];
    
    // Debit From
    const fromAccount = Object.keys(balances).find(k => k === from);
    let calculatedFromBalance = 0;
    if (fromAccount) {
        balances[fromAccount] -= amount;
        calculatedFromBalance = balances[fromAccount];
    }

    // Credit To
    const toAccount = Object.keys(balances).find(k => k === to);
    let calculatedToBalance = 0;
    if (toAccount) {
        balances[toAccount] += amount;
        calculatedToBalance = balances[toAccount];
    }

    // Read logged balances from sheet if available (cols 6 & 7)
    // row[6] = From Balance, row[7] = To Balance
    // If they exist and are not '-', use them for the "trail".
    // Otherwise fallback to the calculated value.
    const loggedFromBal = row[6] && row[6] !== '-' ? parseFloat(row[6]) : null;
    const loggedToBal = row[7] && row[7] !== '-' ? parseFloat(row[7]) : null;

    return {
        date: row[0],
        type: row[1],
        from: from,
        to: to,
        amount: amount,
        description: row[5],
        // Prefer logged balance if valid number, else calculated
        fromBalance: (loggedFromBal !== null && !isNaN(loggedFromBal)) 
            ? loggedFromBal 
            : (fromAccount ? calculatedFromBalance : null),
        toBalance: (loggedToBal !== null && !isNaN(loggedToBal))
            ? loggedToBal
            : (toAccount ? calculatedToBalance : null)
    };
  }).reverse(); // Newest first

  let displayedTransactions = processedTransactions;

  if (accountFilter) {
      const decodedFilter = decodeURIComponent(accountFilter);
      displayedTransactions = processedTransactions.filter(t => 
          t.from === decodedFilter || t.to === decodedFilter
      );
  } else {
      displayedTransactions = processedTransactions.slice(0, 20);
  }

  return {
    balances,
    recentTransactions: displayedTransactions
  };
}
