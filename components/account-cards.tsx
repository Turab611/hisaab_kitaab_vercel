import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";

interface AccountCardsProps {
  balances: Record<string, number>;
}

export default function AccountCards({ balances }: AccountCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Object.entries(balances).map(([account, balance]) => (
        <Card
          key={account}
          className={cn(
            "transition-all hover:shadow-lg",
            balance < 0
              ? "border-red-500/50 bg-red-500/10"
              : "border-green-500/50 bg-green-500/10",
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
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
