import { fetchDashboardData } from "@/app/actions";
import AccountCards from "@/components/account-cards";
import TransactionForm from "@/components/transaction-form";
import TransactionHistory from "@/components/transaction-history";
import Image from "next/image";

// Force dynamic rendering to ensure fresh data on each request
export const dynamic = "force-dynamic";

interface HomeProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const sp = await searchParams;
  const filter = typeof sp.filter === "string" ? sp.filter : undefined;
  const { balances, recentTransactions } = await fetchDashboardData(filter);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex justify-between items-center">
            <Image src="/logo.png" alt="Logo" width={200} height={200} />
          <span>
            <h1 className="text-3xl font-bold tracking-tight text-slate-100">
              Hisaab Kitaab
            </h1>
          </span>
          <div className="text-sm text-slate-400">
            {new Date().toLocaleDateString("en-PK", {
              weekday: "long",
              year: "numeric",
              month: "numeric",
              day: "numeric",
            })}
          </div>
        </header>

        {/* Account Summary */}
        <section>
          <AccountCards balances={balances} />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Transaction Form - Takes up 1 column on large screens */}
          <section className="lg:col-span-1">
            <TransactionForm />
          </section>

          {/* Transaction History - Takes up 2 columns on large screens */}
          <section className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold text-slate-200">
              {filter ? `Transactions for ${filter}` : "Recent Transactions"}
            </h2>
            {filter && (
              <div className="text-sm text-muted-foreground">
                Note: Showing all transactions involving this account.
              </div>
            )}
            <TransactionHistory transactions={recentTransactions} />
          </section>
        </div>
      </div>
    </main>
  );
}
