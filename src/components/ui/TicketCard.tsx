'use client';

import type { Ticket } from '@/types/database';

interface TicketCardProps {
  ticket: Ticket;
  className?: string;
  showPurchaseReminder?: boolean;
}

/**
 * Ticket/reservation card with purchase status
 * Shows confirmation for purchased tickets, purchase reminders for unpurchased
 */
export function TicketCard({ ticket, className = '', showPurchaseReminder = true }: TicketCardProps) {
  const isPurchased = ticket.status === 'purchased';
  const confirmations = ticket.confirmations ? JSON.parse(ticket.confirmations) : [];
  const tips = ticket.tips ? JSON.parse(ticket.tips) : [];

  // Parse date string as local date (avoids UTC timezone issues)
  const parseLocalDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year!, month! - 1, day!);
  };

  // Calculate days until ticket sale for unpurchased tickets
  const getDaysUntilSale = () => {
    if (!ticket.purchaseSaleDate) return null;
    const saleDate = parseLocalDate(ticket.purchaseSaleDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    saleDate.setHours(0, 0, 0, 0);
    const diffTime = saleDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilSale = getDaysUntilSale();
  const isUrgent = daysUntilSale !== null && daysUntilSale <= 7;
  const isPast = daysUntilSale !== null && daysUntilSale < 0;

  // Format date for display (parse as local to avoid timezone issues)
  const formatDate = (dateStr: string) => {
    const date = parseLocalDate(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div
      className={`
        relative overflow-hidden rounded-xl
        ${isPurchased
          ? 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200 dark:border-emerald-800'
          : isUrgent
            ? 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 border-2 border-amber-400 dark:border-amber-600'
            : 'bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900/40 dark:to-gray-900/40 border border-slate-200 dark:border-slate-700'
        }
        shadow-md
        ${className}
      `}
    >
      {/* Urgent purchase reminder banner */}
      {!isPurchased && showPurchaseReminder && daysUntilSale !== null && !isPast && (
        <div
          className={`
            px-4 py-2 text-xs font-bold uppercase tracking-wider text-center
            ${isUrgent
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white animate-pulse'
              : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
            }
          `}
        >
          {isUrgent ? '⚠️ ' : '🗓️ '}
          Tickets on sale {daysUntilSale === 0 ? 'TODAY' : daysUntilSale === 1 ? 'tomorrow' : `in ${daysUntilSale} days`}
          {ticket.purchaseSaleTime && ` at ${ticket.purchaseSaleTime} JST`}
        </div>
      )}

      <div className="p-4">
        {/* Header with status badge */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            <h3 className="font-bold text-lg text-foreground leading-tight">{ticket.name}</h3>
            <p className="text-sm text-foreground-secondary">{ticket.locationName}</p>
          </div>

          {/* Status badge */}
          <span
            className={`
              shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold
              ${isPurchased
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-400 dark:bg-slate-600 text-white'
              }
            `}
          >
            {isPurchased ? (
              <>
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Purchased
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="10" />
                </svg>
                Not Purchased
              </>
            )}
          </span>
        </div>

        {/* Event details */}
        <div className="flex flex-wrap gap-4 text-sm mb-3">
          <div className="flex items-center gap-1.5 text-foreground-secondary">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            <span className="font-medium">{formatDate(ticket.date)}</span>
          </div>

          {ticket.entryTime && (
            <div className="flex items-center gap-1.5 text-foreground-secondary">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">{ticket.entryTime}</span>
            </div>
          )}

          {ticket.duration && (
            <div className="flex items-center gap-1.5 text-foreground-secondary">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
              <span>{ticket.duration}</span>
            </div>
          )}
        </div>

        {/* Confirmation codes (if purchased) */}
        {isPurchased && confirmations.length > 0 && (
          <div className="mb-3 p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
            <p className="text-xs text-emerald-700 dark:text-emerald-400 uppercase tracking-wider font-medium mb-1">
              Confirmation {confirmations.length > 1 ? 'Codes' : 'Code'}
            </p>
            <div className="flex flex-wrap gap-2">
              {confirmations.map((code: string, i: number) => (
                <code
                  key={i}
                  className="px-2 py-1 bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200 rounded font-mono text-sm font-bold"
                >
                  {code}
                </code>
              ))}
            </div>
          </div>
        )}

        {/* Purchase info (if not purchased) */}
        {!isPurchased && ticket.purchaseWebsite && (
          <div className="mb-3 p-3 bg-amber-100/50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <p className="text-xs text-amber-700 dark:text-amber-400 uppercase tracking-wider font-medium mb-2">
              Purchase Details
            </p>
            <a
              href={ticket.purchaseWebsite}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-700 dark:text-amber-400 hover:underline"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
              Open Purchase Site
            </a>
            {ticket.purchaseNotes && (
              <p className="mt-2 text-xs text-amber-600 dark:text-amber-500">{ticket.purchaseNotes}</p>
            )}
          </div>
        )}

        {/* Special note (e.g., "Emma's Birthday!") */}
        {ticket.specialNote && (
          <div className="mb-3 px-3 py-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg border border-pink-200 dark:border-pink-800">
            <p className="text-sm font-medium text-pink-700 dark:text-pink-300">
              ✨ {ticket.specialNote}
            </p>
          </div>
        )}

        {/* Tips section */}
        {tips.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
            <p className="text-xs text-foreground-tertiary uppercase tracking-wider font-medium mb-2">Tips</p>
            <ul className="space-y-1">
              {tips.slice(0, 2).map((tip: string, i: number) => (
                <li key={i} className="text-xs text-foreground-secondary flex items-start gap-1.5">
                  <span className="text-amber-500">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Compact ticket card for list views
 */
export function TicketCardCompact({ ticket, className = '' }: Omit<TicketCardProps, 'showPurchaseReminder'>) {
  const isPurchased = ticket.status === 'purchased';

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div
      className={`
        flex items-center gap-3 p-3 rounded-lg
        ${isPurchased
          ? 'bg-emerald-50 dark:bg-emerald-950/30'
          : 'bg-amber-50 dark:bg-amber-950/30'
        }
        ${className}
      `}
    >
      <div
        className={`
          shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg
          ${isPurchased
            ? 'bg-emerald-500 text-white'
            : 'bg-amber-500 text-white'
          }
        `}
      >
        {isPurchased ? '✓' : '🎫'}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-foreground truncate">{ticket.name}</p>
        <p className="text-xs text-foreground-secondary">
          {formatDate(ticket.date)}
          {ticket.entryTime && ` • ${ticket.entryTime}`}
        </p>
      </div>

      {!isPurchased && (
        <span className="shrink-0 px-2 py-0.5 bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 rounded text-xs font-medium">
          Buy
        </span>
      )}
    </div>
  );
}
