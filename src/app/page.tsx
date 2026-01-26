export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="text-center">
        <h1 className="mb-2 text-4xl font-bold text-primary-900 dark:text-warm-100">FTC: Nihon</h1>
        <p className="mb-8 text-lg text-primary-600 dark:text-warm-300">Travel Concierge</p>
        <div className="rounded-xl bg-warm-100 p-6 dark:bg-primary-800">
          <p className="text-sm text-primary-700 dark:text-warm-200">March 6-21, 2026</p>
          <p className="mt-2 text-2xl font-semibold text-accent">日本</p>
        </div>
      </div>
    </main>
  );
}
