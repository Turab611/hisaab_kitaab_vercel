import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface Transaction {
  date: string;
  type: string;
  from: string;
  to: string;
  amount: number;
  description: string;
}

interface TransactionHistoryProps {
  transactions: Transaction[];
}

export default function TransactionHistory({
  transactions,
}: TransactionHistoryProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No transactions found.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>From</TableHead>
            <TableHead>To</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((t, i) => (
            <TableRow key={i}>
              <TableCell>{new Date(t.date).toLocaleDateString()}</TableCell>
              <TableCell>
                <span
                  className={cn(
                    "px-2 py-1 rounded-full text-xs font-semibold",
                    t.type === "Income"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800",
                  )}
                >
                  {t.type}
                </span>
              </TableCell>
              <TableCell>{t.from}</TableCell>
              <TableCell>{t.to}</TableCell>
              <TableCell
                className="max-w-[200px] truncate"
                title={t.description}
              >
                {t.description}
              </TableCell>
              <TableCell
                className={cn(
                  "text-right font-medium",
                  t.type === "Income" ? "text-green-600" : "text-red-600",
                )}
              >
                {t.type === "Outgoing" ? "-" : "+"}
                {new Intl.NumberFormat("en-PK", {
                  style: "currency",
                  currency: "PKR",
                }).format(t.amount)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
