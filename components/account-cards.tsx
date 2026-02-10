"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface AccountCardsProps {
  balances: Record<string, number>;
}

export default function AccountCards({ balances }: AccountCardsProps) {
  const searchParams = useSearchParams();
  const currentFilter = searchParams.get("filter");

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Object.entries(balances).map(([account, balance]) => {
        const isActive = currentFilter === account;
        // Toggle: If active, link to home (no filter). If inactive, link to filter.
        const href = isActive ? "/" : `/?filter=${encodeURIComponent(account)}`;

        return (
          <Link key={account} href={href}>
            <Card
              className={cn(
                "transition-all hover:shadow-lg cursor-pointer",
                isActive
                  ? "ring-4 ring-primary bg-primary/20 scale-[1.02]"
                  : "opacity-90",
                balance < 0
                  ? "border-red-500/50 bg-red-950/20"
                  : "border-green-500/50 bg-green-950/20",
              )}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{account}</CardTitle>
                {balance >= 0 ? (
                  <ArrowUpIcon className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4 text-red-500" />
                )}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Intl.NumberFormat("en-PK", {
                    style: "currency",
                    currency: "PKR",
                  }).format(balance)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {balance >= 0 ? "Current Balance" : "Overdrawn / Owed"}
                </p>
                {isActive && (
                  <p className="text-xs text-primary font-bold mt-2 uppercase tracking-wider">
                    ● Filter Applied
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
