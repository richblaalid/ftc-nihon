'use client';

import { useState, useEffect } from 'react';
import { usePreTripChecklist } from '@/db/hooks';
import { db } from '@/db/database';
import type { ChecklistItem } from '@/types/database';

/**
 * Format due date for display (only call client-side after mount)
 */
function formatDueDate(dueDate: string | null, now: Date): string {
  if (!dueDate) return '';

  const date = new Date(dueDate);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  const diffTime = date.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'Overdue';
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays <= 7) return `${diffDays} days`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Get urgency class based on due date (only call client-side after mount)
 */
function getUrgencyClass(dueDate: string | null, now: Date): string {
  if (!dueDate) return 'text-foreground-tertiary';

  const date = new Date(dueDate);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  const diffTime = date.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'text-error';
  if (diffDays <= 3) return 'text-warning';
  return 'text-foreground-tertiary';
}

/**
 * Mark checklist item as completed
 */
async function markComplete(item: ChecklistItem) {
  await db.checklistItems.update(item.id, {
    isCompleted: true,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Confirmation modal for marking item complete
 */
function ConfirmModal({
  item,
  onConfirm,
  onCancel,
}: {
  item: ChecklistItem;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-background rounded-xl p-5 max-w-sm w-full shadow-xl">
        <h3 className="text-lg font-semibold text-foreground">Mark as Complete?</h3>
        <p className="mt-2 text-foreground-secondary">{item.title}</p>
        <div className="mt-4 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 px-4 rounded-lg border border-foreground-tertiary text-foreground font-medium hover:bg-background-secondary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 px-4 rounded-lg bg-success text-white font-medium hover:bg-success/90 transition-colors"
          >
            Complete
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Single checklist item row - expandable
 */
function ChecklistRow({
  item,
  now,
  onRequestComplete,
}: {
  item: ChecklistItem;
  now: Date;
  onRequestComplete: (item: ChecklistItem) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="p-3 rounded-lg hover:bg-background-secondary transition-colors">
      <div className="flex items-start gap-3">
        {/* Checkbox - only clickable for incomplete items */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (!item.isCompleted) {
              onRequestComplete(item);
            }
          }}
          disabled={item.isCompleted}
          className={`
            mt-0.5 h-5 w-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors
            ${item.isCompleted
              ? 'bg-success border-success text-white cursor-default'
              : 'border-foreground-tertiary hover:border-primary cursor-pointer'
            }
          `}
          aria-label={item.isCompleted ? 'Completed' : 'Mark as complete'}
        >
          {item.isCompleted && (
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* Content - tap to expand */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex-1 min-w-0 text-left"
        >
          <div className="flex items-start justify-between gap-2">
            <p className={`font-medium ${item.isCompleted ? 'line-through text-foreground-tertiary' : 'text-foreground'}`}>
              {item.title}
            </p>
            {/* Due date */}
            {item.dueDate && !item.isCompleted && (
              <span className={`text-xs font-medium shrink-0 ${getUrgencyClass(item.dueDate, now)}`}>
                {formatDueDate(item.dueDate, now)}
              </span>
            )}
          </div>

          {/* Description - truncated or full */}
          {item.description && !item.isCompleted && (
            <p className={`text-sm text-foreground-secondary mt-1 ${isExpanded ? '' : 'line-clamp-2'}`}>
              {item.description}
            </p>
          )}

          {/* Due time when expanded */}
          {isExpanded && item.dueTime && !item.isCompleted && (
            <p className="text-xs text-foreground-tertiary mt-2">
              Due time: {item.dueTime}
            </p>
          )}

          {/* Expand indicator */}
          {item.description && !item.isCompleted && (
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-primary">
                {isExpanded ? 'Show less' : 'Tap for details'}
              </span>
              <svg
                className={`w-3 h-3 text-primary transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          )}
        </button>
      </div>
    </div>
  );
}

const COLLAPSED_ITEM_COUNT = 3;

/**
 * Trip preparation checklist card
 */
export function TripPrepCard() {
  const checklistItems = usePreTripChecklist();
  // Track mount state to avoid hydration mismatch with date calculations
  const [now, setNow] = useState<Date | null>(null);
  const [isListExpanded, setIsListExpanded] = useState(false);
  const [confirmingItem, setConfirmingItem] = useState<ChecklistItem | null>(null);

  useEffect(() => {
    setNow(new Date());
  }, []);

  // Handle completion confirmation
  const handleConfirmComplete = async () => {
    if (confirmingItem) {
      await markComplete(confirmingItem);
      setConfirmingItem(null);
    }
  };

  // Loading state (waiting for mount or data)
  if (checklistItems === undefined || now === null) {
    return (
      <div className="card animate-pulse">
        <div className="h-5 w-32 rounded bg-background-secondary" />
        <div className="mt-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-5 w-5 rounded bg-background-secondary" />
              <div className="h-4 flex-1 rounded bg-background-secondary" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // No items
  if (!checklistItems || checklistItems.length === 0) {
    return (
      <div className="card">
        <h2 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider flex items-center gap-2">
          <span>✅</span>
          Trip Prep
        </h2>
        <p className="mt-4 text-foreground-tertiary text-center py-4">
          All done! Ready for Japan!
        </p>
      </div>
    );
  }

  // Sort: incomplete first (by due date), then completed
  const sortedItems = [...checklistItems].sort((a, b) => {
    if (a.isCompleted !== b.isCompleted) {
      return a.isCompleted ? 1 : -1;
    }
    if (!a.isCompleted && a.dueDate && b.dueDate) {
      return a.dueDate.localeCompare(b.dueDate);
    }
    return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
  });

  const incompleteCount = checklistItems.filter((item) => !item.isCompleted).length;
  const totalCount = checklistItems.length;
  const hasMore = sortedItems.length > COLLAPSED_ITEM_COUNT;
  const displayedItems = isListExpanded ? sortedItems : sortedItems.slice(0, COLLAPSED_ITEM_COUNT);
  const hiddenCount = sortedItems.length - COLLAPSED_ITEM_COUNT;

  return (
    <>
      <div className="card">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider flex items-center gap-2">
            <span>📋</span>
            Trip Prep
          </h2>
          <span className="text-xs text-foreground-tertiary">
            {totalCount - incompleteCount}/{totalCount} done
          </span>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-1.5 bg-background-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-success transition-all duration-300"
            style={{ width: `${((totalCount - incompleteCount) / totalCount) * 100}%` }}
          />
        </div>

        {/* Checklist items */}
        <div className="mt-3 -mx-3">
          {displayedItems.map((item) => (
            <ChecklistRow
              key={item.id}
              item={item}
              now={now}
              onRequestComplete={setConfirmingItem}
            />
          ))}
        </div>

        {/* Show more/less button */}
        {hasMore && (
          <button
            onClick={() => setIsListExpanded(!isListExpanded)}
            className="w-full mt-2 py-2 text-sm font-medium text-primary hover:text-primary-hover transition-colors"
          >
            {isListExpanded ? 'Show less' : `Show ${hiddenCount} more`}
          </button>
        )}
      </div>

      {/* Confirmation modal */}
      {confirmingItem && (
        <ConfirmModal
          item={confirmingItem}
          onConfirm={handleConfirmComplete}
          onCancel={() => setConfirmingItem(null)}
        />
      )}
    </>
  );
}
