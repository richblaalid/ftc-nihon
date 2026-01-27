'use client';

import type { Restaurant } from '@/types/database';

interface RestaurantCardProps {
  restaurant: Restaurant;
  isPrimary: boolean;
  isSelected: boolean;
  isHighlighted: boolean;
  onClick: () => void;
}

/**
 * Restaurant card displayed in the options list
 * Shows restaurant name, type, price range, and kid-friendly status
 */
export function RestaurantCard({
  restaurant,
  isPrimary,
  isSelected,
  isHighlighted,
  onClick,
}: RestaurantCardProps) {
  return (
    <button
      onClick={onClick}
      data-testid="restaurant-card"
      className={`card w-full text-left transition-all active:scale-[0.98] ${
        isHighlighted
          ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
          : ''
      } ${isSelected ? 'border-primary border-2' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Name and badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-foreground truncate">
              {restaurant.name}
            </h3>
            {isPrimary && (
              <span className="shrink-0 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                Recommended
              </span>
            )}
            {isSelected && (
              <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                Selected
              </span>
            )}
          </div>

          {/* Japanese name if available */}
          {restaurant.nameJapanese && (
            <p className="mt-0.5 text-sm text-foreground-secondary">
              {restaurant.nameJapanese}
            </p>
          )}

          {/* Type and price */}
          <div className="mt-2 flex items-center gap-3 text-sm text-foreground-secondary">
            {restaurant.type && <span>{restaurant.type}</span>}
            {restaurant.priceRange && (
              <>
                <span className="text-foreground-tertiary">·</span>
                <span>{restaurant.priceRange}</span>
              </>
            )}
          </div>

          {/* Location info */}
          {restaurant.nearestStation && (
            <p className="mt-1 text-xs text-foreground-tertiary">
              Near {restaurant.nearestStation}
            </p>
          )}
        </div>

        {/* Kid-friendly and chevron */}
        <div className="flex flex-col items-end gap-2">
          {restaurant.isKidFriendly && (
            <span
              className="text-lg"
              role="img"
              aria-label="Kid-friendly"
              title="Kid-friendly"
            >
              👶
            </span>
          )}
          <span className="text-foreground-tertiary">›</span>
        </div>
      </div>

      {/* What to order preview */}
      {restaurant.whatToOrder && (
        <p className="mt-2 text-sm text-foreground-secondary line-clamp-1">
          Try: {restaurant.whatToOrder}
        </p>
      )}
    </button>
  );
}
