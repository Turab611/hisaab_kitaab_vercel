"use client";

import { useState } from "react";
import { submitTransaction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const accounts = [
  "HBL (Main)",
  "Alfalah (Petty)",
  "Ashari (Turab)",
  "Ashari (Ali)",
  "Ashari (Fahad)",
  "Cash",
];

const categories = [
  "Food",
  "Fuel",
  "Office",
  "Salary",
  "Utilities",
  "Transport",
  "Entertainment",
  "Medical",
  "Miscellaneous",
];

const quickNotes = [
  "Lunch",
  "Dinner",
  "Tea/Coffee",
  "Fuel Refill",
  "Uber/Careem",
  "Groceries",
];

export default function TransactionForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [note, setNote] = useState("");

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    try {
      await submitTransaction(formData);
      // Reset form logic would go here, but easiest is to rely on key reset or manual clear if needed.
      // For now, we'll just reload the page or let the server action revalidate.
      setNote("");
      const form = document.getElementById(
        "transaction-form",
      ) as HTMLFormElement;
      form.reset();
    } catch (error) {
      console.error(error);
      alert("Failed to submit transaction");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>New Transaction</CardTitle>
      </CardHeader>
      <CardContent>
        <form id="transaction-form" action={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select name="type" defaultValue="Outgoing">
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Income">Income</SelectItem>
                  <SelectItem value="Outgoing">Outgoing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="account">Account</Label>
              <Select name="account" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select Account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((acc) => (
                    <SelectItem key={acc} value={acc}>
                      {acc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input type="number" name="amount" placeholder="0.00" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select name="category">
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              name="notes"
              placeholder="Add details..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {quickNotes.map((qn) => (
                <button
                  type="button"
                  key={qn}
                  onClick={() =>
                    setNote((prev) => (prev ? `${prev}, ${qn}` : qn))
                  }
                  className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-md hover:bg-secondary/80 transition-colors"
                >
                  {qn}
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              "Add Transaction"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
