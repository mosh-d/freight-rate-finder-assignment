// QuoteCard — one quote: carrier, transit days, total; expands to reveal
// PriceBreakdown. Plan notes (commit 11):
//   - Expansion: native <details>/<summary>, or a button with aria-expanded +
//     aria-controls — keyboard reachable either way.
//   - React key: quote.id (stable across identical searches by design).
// Style: cream card, thin gold border, generous radius; mono uppercase eyebrow
// for the carrier label per PLAN.md §UI style guide.
import type { Quote } from "../types";
import PriceBreakdown from "./PriceBreakdown";

interface QuoteCardProps {
  quote: Quote;
}

export default function QuoteCard({ quote }: QuoteCardProps) {
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: quote.currency,
    }).format(cents / 100);
  };

  return (
    <details className="group bg-secondary-light/10 border border-secondary-light rounded-lg overflow-hidden">
      <summary className="cursor-pointer p-4 hover:bg-secondary-light/20 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs font-mono uppercase tracking-wider text-secondary mb-1">
              {quote.carrier}
            </p>
            <p className="text-sm text-secondary">
              {quote.transitDays} {quote.transitDays === 1 ? "day" : "days"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-primary-dark">
              {formatCurrency(quote.totalCents)}
            </p>
            <p className="text-xs text-secondary-light group-open:hidden">
              Click to expand
            </p>
            <p className="text-xs text-secondary-light hidden group-open:inline">
              Click to collapse
            </p>
          </div>
        </div>
      </summary>
      <div className="p-4 border-t border-secondary-light">
        <PriceBreakdown quote={quote} />
      </div>
    </details>
  );
}
