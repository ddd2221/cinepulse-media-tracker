import { Clock, Heart, Star, Film } from 'lucide-react';
import type { MediaStats } from '../types/media';

interface StatBoxProps {
  label: string;
  value: string | number;
  subtext?: string;
  accentColor?: string;
  icon: typeof Clock;
}

function StatBox({ label, value, subtext, accentColor = 'text-[#00e054]', icon: Icon }: StatBoxProps) {
  return (
    <div className="rounded-sm border border-[#2c3440] bg-[#1f252c] p-4 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#99aabb]">
          {label}
        </span>
        <Icon size={16} className={accentColor} />
      </div>
      <div>
        <p className="font-serif text-3xl font-extrabold text-white">{value}</p>
        {subtext && <p className="mt-1 text-[11px] text-[#667788]">{subtext}</p>}
      </div>
    </div>
  );
}

export default function StatsOverview({ stats }: { stats: MediaStats }) {
  const maxGenre = Math.max(1, ...stats.genreBreakdown.map((g) => g.count));
  const maxRating = Math.max(1, ...stats.ratingDistribution);

  return (
    <section aria-label="Viewing Analytics" className="space-y-6">
      {/* 4 Primary Letterboxd Metric Boxes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatBox
          label="Films & Series"
          value={stats.totalTitles}
          subtext={`${stats.completed} marked as watched`}
          accentColor="text-[#00e054]"
          icon={Film}
        />
        <StatBox
          label="Hours Watched"
          value={stats.hoursWatched}
          subtext={`≈ ${(stats.hoursWatched / 24).toFixed(1)} days of cinema`}
          accentColor="text-[#40bcf4]"
          icon={Clock}
        />
        <StatBox
          label="Liked Titles"
          value={stats.likedCount}
          subtext="Letterboxd favorites"
          accentColor="text-[#ff8000]"
          icon={Heart}
        />
        <StatBox
          label="Average Score"
          value={stats.averageRating ? `${stats.averageRating}` : '—'}
          subtext={`Streak: ${stats.currentStreak}d (best: ${stats.longestStreak}d)`}
          accentColor="text-[#ffc000]"
          icon={Star}
        />
      </div>

      {/* Two Column Visual Breakdowns: Ratings Histogram & Genre Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Rating Distribution Histogram (Letterboxd Green Bars) */}
        <div className="rounded-sm border border-[#2c3440] bg-[#1f252c] p-5">
          <div className="lb-section-header mb-4">
            <span>RATING DISTRIBUTION</span>
            <span className="text-[10px] text-[#667788]">SCORES 1 – 10</span>
          </div>

          <div className="flex h-44 items-end gap-1.5 pt-4 pb-2" role="img" aria-label="Histogram of user ratings">
            {stats.ratingDistribution.map((count, i) => {
              const heightPct = (count / maxRating) * 100;
              return (
                <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1 group">
                  <span className="text-[10px] font-bold text-[#00e054] opacity-0 group-hover:opacity-100 transition">
                    {count || ''}
                  </span>
                  <div
                    className="w-full rounded-[1px] bg-[#00e054] transition-all duration-500 group-hover:bg-[#00c048]"
                    style={{
                      height: `${heightPct}%`,
                      minHeight: count ? '4px' : '2px',
                      opacity: count ? 1 : 0.15,
                    }}
                  />
                  <span className="text-[11px] font-mono text-[#667788] group-hover:text-white transition">
                    {i + 1}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Genres Breakdown */}
        <div className="rounded-sm border border-[#2c3440] bg-[#1f252c] p-5">
          <div className="lb-section-header mb-4">
            <span>GENRE BREAKDOWN</span>
            <span className="text-[10px] text-[#667788]">TOP TASTES</span>
          </div>

          {stats.genreBreakdown.length === 0 ? (
            <p className="text-xs text-[#667788] py-8 text-center">
              Log films or series to view your genre breakdown.
            </p>
          ) : (
            <ul className="space-y-2.5">
              {stats.genreBreakdown.slice(0, 7).map((g) => (
                <li key={g.genre} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-200">{g.genre}</span>
                    <span className="text-[11px] text-[#99aabb] font-mono">{g.count} titles</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-[#14181c]">
                    <div
                      className="h-full rounded-full bg-[#00e054] transition-all duration-700"
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
