// PriceBreakdown — the line items + total for one quote. Plan notes (commit 11):
//   - Format cents with Intl.NumberFormat("en-US", { style: "currency",
//     currency: quote.currency }) applied to amountCents / 100 — formatting is
//     the only place cents become decimals.
//   - Total row visually distinct; a <dl> or small table both read fine.
import type { Quote } from "../types";

interface PriceBreakdownProps {
  quote: Quote;
}

export default function PriceBreakdown({ quote }: PriceBreakdownProps) {
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: quote.currency,
    }).format(cents / 100);
  };

  return (
    <dl className="space-y-2 text-sm">
      {quote.lineItems.map((item, index) => (
        <div key={index} className="flex justify-between">
          <dt className="text-secondary-dark/80">{item.label}</dt>
          <dd className="font-medium text-secondary-dark">{formatCurrency(item.amountCents)}</dd>
        </div>
      ))}
      <div className="flex justify-between pt-2 border-t border-secondary-light mt-2">
        <dt className="font-semibold text-secondary-dark">Total</dt>
        <dd className="font-semibold text-secondary-dark">
          {formatCurrency(quote.totalCents)}
        </dd>
      </div>
    </dl>
  );
}
