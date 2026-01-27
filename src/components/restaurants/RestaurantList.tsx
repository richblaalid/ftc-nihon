'use client';

import { useRef, useEffect } from 'react';
import type { Restaurant } from '@/types/database';
import { RestaurantCard } from './RestaurantCard';

interface RestaurantListProps {
  restaurants: Restaurant[];
  primaryId: string | null;
  selectedId: string | null;
  highlightedId: string | null;
  onCardClick: (restaurant: Restaurant) => void;
}

/**
 * Scrollable list of restaurant cards
 * Highlights the primary recommendation and selected restaurant
 */
export function RestaurantList({
  restaurants,
  primaryId,
  selectedId,
  highlightedId,
  onCardClick,
}: RestaurantListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Scroll to highlighted card when it changes
  useEffect(() => {
    if (highlightedId && cardRefs.current.has(highlightedId)) {
      const cardElement = cardRefs.current.get(highlightedId);
      cardElement?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [highlightedId]);

  if (restaurants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center px-4">
        <span className="text-4xl">🍽️</span>
        <p className="mt-2 text-foreground-secondary">No restaurant options</p>
        <p className="text-sm text-foreground-tertiary">
          No restaurants match your current filters
        </p>
      </div>
    );
  }

  // Sort to put primary first, then selected, then rest
  const sortedRestaurants = [...restaurants].sort((a, b) => {
    if (a.id === primaryId) return -1;
    if (b.id === primaryId) return 1;
    if (a.id === selectedId) return -1;
    if (b.id === selectedId) return 1;
    return 0;
  });

  return (
    <div ref={listRef} className="p-4 space-y-3">
      {sortedRestaurants.map((restaurant) => (
        <div
          key={restaurant.id}
          ref={(el) => {
            if (el) {
              cardRefs.current.set(restaurant.id, el);
            } else {
              cardRefs.current.delete(restaurant.id);
            }
          }}
        >
          <RestaurantCard
            restaurant={restaurant}
            isPrimary={restaurant.id === primaryId}
            isSelected={restaurant.id === selectedId}
            isHighlighted={restaurant.id === highlightedId}
            onClick={() => onCardClick(restaurant)}
          />
        </div>
      ))}
    </div>
  );
}
