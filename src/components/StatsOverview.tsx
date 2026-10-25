import { Clock, Heart, Star, Film } from 'lucide-react';
import type { MediaStats } from '../types/media';

interface StatBoxProps {
  label: string;
  value: string | number;
  subtext?: string;
  accentColor?: string;
  icon: typeof Clock;
}

function StatBox({ label, value, subtext, accentColor = 'text-amber-400', icon: Icon }: StatBoxProps) {
  return (
    <div className="obsidian-surface p-4 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
          {label}
        </span>
        <Icon size={16} className={accentColor} />
      </div>
      <div>
        <p className="font-serif text-3xl font-bold text-white">{value}</p>
        {subtext && <p className="mt-1 font-mono text-[11px] text-zinc-500">{subtext}</p>}
      </div>
    </div>
  );
}

export default function StatsOverview({ stats }: { stats: MediaStats }) {
  const maxGenre = Math.max(1, ...stats.genreBreakdown.map((g) => g.count));
  const maxRating = Math.max(1, ...stats.ratingDistribution);

  return (
    <section aria-label="Viewing Analytics" className="space-y-6">
      {/* 4 Metric Boxes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <StatBox
          label="Vault Archive"
          value={stats.totalTitles}
          subtext={`${stats.completed} completed titles`}
          accentColor="text-emerald-400"
          icon={Film}
        />
        <StatBox
          label="Time Invested"
          value={`${stats.hoursWatched}h`}
          subtext={`≈ ${(stats.hoursWatched / 24).toFixed(1)} days of cinema`}
          accentColor="text-indigo-400"
          icon={Clock}
        />
        <StatBox
          label="Favorites"
          value={stats.likedCount}
          subtext="Curated personal masterworks"
          accentColor="text-rose-400"
          icon={Heart}
        />
        <StatBox
          label="Mean Rating"
          value={stats.averageRating ? `${stats.averageRating}` : '—'}
          subtext={`Streak: ${stats.currentStreak}d (best: ${stats.longestStreak}d)`}
          accentColor="text-amber-400"
          icon={Star}
        />
      </div>

      {/* Visual Charts: Amber Rating Histogram & Genre Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Rating Distribution Histogram (Amber 35mm Gold Bars) */}
        <div className="obsidian-surface p-5">
          <div className="section-divider mb-4">
            <span>RATING DISTRIBUTION</span>
            <span className="text-[10px] text-amber-500/90 font-mono">SCORES 1 – 10</span>
          </div>

          <div className="flex h-44 items-end gap-1.5 pt-4 pb-2" role="img" aria-label="Histogram of user ratings">
            {stats.ratingDistribution.map((count, i) => {
              const heightPct = (count / maxRating) * 100;
              return (
                <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1 group">
                  <span className="font-mono text-[10px] font-bold text-amber-400 opacity-0 group-hover:opacity-100 transition">
                    {count || ''}
                  </span>
                  <div
                    className="w-full rounded-[2px] bg-gradient-to-t from-amber-600 to-amber-400 transition-all duration-500 group-hover:from-amber-500 group-hover:to-amber-300"
                    style={{
                      height: `${heightPct}%`,
                      minHeight: count ? '4px' : '2px',
                      opacity: count ? 1 : 0.15,
                    }}
                  />
                  <span className="font-mono text-[11px] text-zinc-500 group-hover:text-white transition">
                    {i + 1}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Genre Breakdown */}
        <div className="obsidian-surface p-5">
          <div className="section-divider mb-4">
            <span>GENRE BREAKDOWN</span>
            <span className="text-[10px] text-zinc-500 font-mono">AFFINITY</span>
          </div>

          {stats.genreBreakdown.length === 0 ? (
            <p className="font-mono text-xs text-zinc-500 py-8 text-center">
              Add movies or series to your vault to generate insights.
            </p>
          ) : (
            <ul className="space-y-3">
              {stats.genreBreakdown.slice(0, 7).map((g) => (
                <li key={g.genre} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-zinc-200">{g.genre}</span>
                    <span className="font-mono text-[11px] text-zinc-400">{g.count} titles</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-[#0a0a0c]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-700"
                      style={{ width: `${(g.count / maxGenre) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
