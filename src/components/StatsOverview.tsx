import { Clock, Flame, Star, Tv } from 'lucide-react';
import type { MediaStats } from '../types/media';

function Card({ icon: Icon, label, value, hint, accent }: { icon: typeof Clock; label: string; value: string; hint?: string; accent: string }) {
  return (
    <div className="glass animate-fadeUp rounded-2xl p-4">
      <div className={`mb-3 grid h-9 w-9 place-items-center rounded-lg ${accent}`}><Icon size={18} /></div>
      <p className="text-2xl font-extrabold text-white">{value}</p>
      <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export default function StatsOverview({ stats }: { stats: MediaStats }) {
  const maxGenre = Math.max(1, ...stats.genreBreakdown.map((g) => g.count));
  const maxRating = Math.max(1, ...stats.ratingDistribution);

  return (
    <section aria-label="Analytics" className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card icon={Clock} label="Hours watched" value={String(stats.hoursWatched)} hint={`${(stats.hoursWatched / 24).toFixed(1)} days of your life`} accent="bg-pulse-500/20 text-pulse-400" />
        <Card icon={Tv} label="Completed" value={`${stats.completed}/${stats.totalTitles}`} accent="bg-neon-500/20 text-neon-400" />
        <Card icon={Star} label="Avg rating" value={stats.averageRating ? `${stats.averageRating}` : '–'} accent="bg-amber-500/20 text-amber-400" />
        <Card icon={Flame} label="Streak" value={`${stats.currentStreak}d`} hint={`Longest: ${stats.longestStreak}d`} accent="bg-orange-500/20 text-orange-400" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="glass rounded-2xl p-5">
          <h3 className="mb-4 font-bold text-white">Genre breakdown</h3>
          {stats.genreBreakdown.length === 0 && <p className="text-sm text-slate-500">Add titles to see your tastes.</p>}
          <ul className="space-y-3">
            {stats.genreBreakdown.slice(0, 7).map((g) => (
              <li key={g.genre}>
                <div className="mb-1 flex justify-between text-xs"><span className="text-slate-300">{g.genre}</span><span className="text-slate-500">{g.count}</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-ink-900">
                  <div className="h-full rounded-full bg-gradient-to-r from-pulse-500 to-neon-400 transition-all duration-700" style={{ width: `${(g.count / maxGenre) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="glass rounded-2xl p-5">
          <h3 className="mb-4 font-bold text-white">Rating distribution</h3>
          <div className="flex h-44 items-end gap-2" role="img" aria-label="Bar chart of ratings from 1 to 10">
            {stats.ratingDistribution.map((count, i) => (
              <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                <span className="text-[10px] text-slate-500">{count || ''}</span>
                <div className="w-full rounded-t bg-gradient-to-t from-pulse-600 to-pulse-400 transition-all duration-700" style={{ height: `${(count / maxRating) * 100}%`, minHeight: count ? 4 : 2, opacity: count ? 1 : 0.2 }} />
                <span className="text-xs text-slate-400">{i + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
