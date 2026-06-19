import { Search, X } from 'lucide-react';
import type { MediaType, SearchFilters } from '../types/media';

interface Props {
  filters: SearchFilters;
  onChange: (f: SearchFilters) => void;
}

const TYPES: { id: MediaType | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'movie', label: 'Movies' },
  { id: 'series', label: 'Series' },
  { id: 'episode', label: 'Episodes' },
];

export default function SearchBar({ filters, onChange }: Props) {
  return (
    <section aria-label="Search" className="glass rounded-2xl p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            id="search-input"
            type="search"
            value={filters.query}
            onChange={(e) => onChange({ ...filters, query: e.target.value })}
            placeholder="Search movies, series, genres…"
            aria-label="Search titles"
            className="input py-3 pl-10 pr-10 text-base"
            autoComplete="off"
          />
          {filters.query && (
            <button
              onClick={() => onChange({ ...filters, query: '' })}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 hover:text-white"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <input
          id="year-input"
          type="text"
          inputMode="numeric"
          maxLength={4}
          value={filters.year}
          onChange={(e) => onChange({ ...filters, year: e.target.value.replace(/\D/g, '') })}
          placeholder="Year"
          aria-label="Release year"
          className="input py-3 sm:w-28"
        />
      </div>

      <div role="radiogroup" aria-label="Media type" className="mt-3 flex flex-wrap gap-2">
        {TYPES.map((t) => (
          <button
            key={t.id}
            role="radio"
            aria-checked={filters.type === t.id}
            onClick={() => onChange({ ...filters, type: t.id })}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              filters.type === t.id ? 'bg-pulse-500 text-white' : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </section>
  );
}
