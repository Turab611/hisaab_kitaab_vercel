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
  const [type, setType] = useState("Outgoing");
  const [description, setDescription] = useState("");
  const [outgoingToCustom, setOutgoingToCustom] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    try {
      await submitTransaction(formData);
      setDescription("");
      setOutgoingToCustom(false); // Reset custom state
      const form = document.getElementById(
        "transaction-form",
      ) as HTMLFormElement;
      form.reset();
      // Reset type state nicely or keep it, resetting form resets native inputs but not controlled react state if not careful.
      // We are controlling 'type' via Select onValueChange, so we might need to reset it manually if we want default.
      // For now, keeping the user's selected type is better UX usually.
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
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select name="type" defaultValue="Outgoing" onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Income">Income</SelectItem>
                <SelectItem value="Outgoing">Outgoing</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="from">From</Label>
              {type === "Income" ? (
                <Input
                  name="from"
                  placeholder="Source (Client/Entity)"
                  required
                />
              ) : (
                <Select name="from" required>
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
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="to">To</Label>
              {type === "Income" ? (
                <Select name="to" required>
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
              ) : // Outgoing Logic
              outgoingToCustom ? (
                <div className="flex gap-2">
                  <Input
                    name="to"
                    placeholder="Recipient Name"
                    required
                    autoFocus
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setOutgoingToCustom(false)}
                    title="Back to List"
                  >
                    x
                  </Button>
                </div>
              ) : (
                <Select
                  name="to"
                  required
                  onValueChange={(val) => {
                    if (val === "custom_recipient_trigger") {
                      setOutgoingToCustom(true);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Recipient" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((acc) => (
                      <SelectItem key={acc} value={acc}>
                        {acc} (Transfer)
                      </SelectItem>
                    ))}
                    <SelectItem
                      value="custom_recipient_trigger"
                      className="font-semibold text-primary"
                    >
                      + Other / Vendor
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input type="number" name="amount" placeholder="0.00" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              name="description"
              placeholder="Add details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {quickNotes.map((qn) => (
                <button
                  type="button"
                  key={qn}
                  onClick={() =>
                    setDescription((prev) => (prev ? `${prev}, ${qn}` : qn))
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
