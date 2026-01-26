export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="text-center">
        {/* Display font - Reggae One */}
        <h1 className="font-display text-display-md text-foreground">FTC: NIHON</h1>

        <p className="mb-8 text-lg" style={{ color: 'var(--foreground-secondary)' }}>
          Travel Concierge
        </p>

        {/* Card using design system */}
        <div className="card mx-auto max-w-sm shadow-theme-md">
          <p className="text-sm" style={{ color: 'var(--foreground-tertiary)' }}>
            March 6-21, 2026
          </p>
          <p className="font-display mt-2 text-display-sm text-primary">日本</p>

          {/* Category pills preview */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <span className="pill pill-food">Food</span>
            <span className="pill pill-temple">Temple</span>
            <span className="pill pill-shopping">Shopping</span>
            <span className="pill pill-transit">Transit</span>
          </div>
        </div>

        {/* Button preview */}
        <div className="mt-8 flex flex-col items-center gap-4">
          <button className="btn-primary">Get Started</button>
          <button className="btn-secondary">View Schedule</button>
        </div>
      </div>
    </main>
  );
}
