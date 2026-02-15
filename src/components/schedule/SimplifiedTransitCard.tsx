'use client';

interface SimplifiedTransitCardProps {
  /** Title to display (e.g., "Ropeway to Owakudani") */
  title: string;
  /** Duration in minutes */
  duration: number;
  /** Transit mode for icon selection */
  mode: 'ropeway' | 'cable_car' | 'bus' | 'walk' | 'pirate_ship';
  /** Pass that covers this transit (e.g., "Hakone Free Pass") */
  coveredByPass?: string;
  /** Start time in HH:MM format */
  startTime: string;
  /** Whether this transit is completed */
  isCompleted?: boolean;
}

/**
 * Get icon for transit mode
 */
function getModeIcon(mode: SimplifiedTransitCardProps['mode']): string {
  switch (mode) {
    case 'ropeway':
      return '🚡';
    case 'cable_car':
      return '🚃';
    case 'bus':
      return '🚌';
    case 'walk':
      return '🚶';
    case 'pirate_ship':
      return '🏴‍☠️';
    default:
      return '🚃';
  }
}

/**
 * Get label for transit mode
 */
function getModeLabel(mode: SimplifiedTransitCardProps['mode']): string {
  switch (mode) {
    case 'ropeway':
      return 'Ropeway';
    case 'cable_car':
      return 'Cable Car';
    case 'bus':
      return 'Bus';
    case 'walk':
      return 'Walk';
    case 'pirate_ship':
      return 'Pirate Ship';
    default:
      return 'Transit';
  }
}

/**
 * Format time for display (24h to 12h)
 */
function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  if (hours === undefined || minutes === undefined) return time;

  const suffix = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${suffix}`;
}

/**
 * SimplifiedTransitCard - A compact transit card for scenic/simplified routes
 * Used for Hakone ropeway, cable car, pirate ship, etc.
 */
export function SimplifiedTransitCard({
  title,
  duration,
  mode,
  coveredByPass,
  startTime,
  isCompleted = false,
}: SimplifiedTransitCardProps) {
  const icon = getModeIcon(mode);
  const modeLabel = getModeLabel(mode);

  return (
    <div
      className={`border-l-4 border-category-transit rounded-lg px-3 py-2.5 transition-all ${
        isCompleted ? 'opacity-50' : ''
      }`}
      style={{ backgroundColor: 'var(--transit-card-bg)' }}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left: Icon + Title + Mode */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-lg shrink-0" aria-hidden="true">
            {icon}
          </span>
          <div className="min-w-0">
            <p
              className="font-semibold text-sm truncate"
              style={{ color: 'var(--tc-text-primary)' }}
            >
              {title}
            </p>
            <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--tc-text-secondary)' }}>
              <span>{modeLabel}</span>
              <span style={{ color: 'var(--tc-text-tertiary)' }}>·</span>
              <span>{duration}min</span>
            </div>
          </div>
        </div>

        {/* Right: Time + Pass badge */}
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="text-sm font-medium text-category-transit">
            {formatTime(startTime)}
          </span>
          {coveredByPass && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-success/10 text-success">
              ✓ {coveredByPass}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
