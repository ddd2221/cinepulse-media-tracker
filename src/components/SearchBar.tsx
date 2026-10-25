import { Search, X, Database } from 'lucide-react';
import type { MediaType, SearchFilters } from '../types/media';

interface Props {
  filters: SearchFilters;
  onChange: (f: SearchFilters) => void;
  sourcesCount?: number;
}

const TYPES: { id: MediaType | 'all'; label: string }[] = [
  { id: 'all', label: 'All Archive' },
  { id: 'movie', label: 'Movies' },
  { id: 'series', label: 'TV Series' },
];

export default function SearchBar({ filters, onChange }: Props) {
  return (
    <section aria-label="Search and Filter Archive" className="obsidian-surface p-3.5 sm:p-4 mb-8">
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        {/* Main Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={15} />
          <input
            id="search-input"
            type="search"
            value={filters.query}
            onChange={(e) => onChange({ ...filters, query: e.target.value })}
            placeholder="Search by title, director, cast, or genre (e.g. Villeneuve, Nolan, HBO, Sci-Fi)…"
            aria-label="Search titles"
            className="input-obsidian pl-9 pr-8 text-xs sm:text-sm font-sans"
            autoComplete="off"
          />
          {filters.query && (
            <button
              onClick={() => onChange({ ...filters, query: '' })}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Release Year Filter */}
        <div className="w-full sm:w-28">
          <input
            id="year-input"
            type="text"
            inputMode="numeric"
            maxLength={4}
            value={filters.year}
            onChange={(e) => onChange({ ...filters, year: e.target.value.replace(/\D/g, '') })}
            placeholder="Year"
            aria-label="Release year"
            className="input-obsidian text-xs sm:text-sm text-center font-mono"
          />
        </div>
      </div>

      {/* Filter Tabs and Data Engine Badge */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06] pt-3">
        <div role="radiogroup" aria-label="Media category filter" className="flex items-center gap-1.5">
          {TYPES.map((t) => (
            <button
              key={t.id}
              role="radio"
              aria-checked={filters.type === t.id}
              onClick={() => onChange({ ...filters, type: t.id })}
              className={`rounded-md px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider transition ${
                filters.type === t.id
                  ? 'bg-amber-500 text-zinc-950 font-bold shadow-sm shadow-amber-500/20'
                  : 'bg-white/[0.04] text-zinc-400 hover:text-white border border-white/[0.06]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 font-mono text-[10px] text-zinc-500">
          <Database size={11} className="text-amber-500" />
          <span>Multi-Source Engine: TVMaze · iTunes · OMDb · TMDB</span>
        </div>
      </div>
    </section>
  );
}
