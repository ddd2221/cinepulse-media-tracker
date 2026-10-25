import { Search, X, Database } from 'lucide-react';
import type { MediaType, SearchFilters } from '../types/media';

interface Props {
  filters: SearchFilters;
  onChange: (f: SearchFilters) => void;
  sourcesCount?: number;
}

const TYPES: { id: MediaType | 'all'; label: string }[] = [
  { id: 'all', label: 'All Media' },
  { id: 'movie', label: 'Films' },
  { id: 'series', label: 'Series' },
];

export default function SearchBar({ filters, onChange }: Props) {
  return (
    <section aria-label="Search and Filter" className="rounded-sm border border-[#2c3440] bg-[#1f252c] p-3 sm:p-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        {/* Main Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#667788]" size={15} />
          <input
            id="search-input"
            type="search"
            value={filters.query}
            onChange={(e) => onChange({ ...filters, query: e.target.value })}
            placeholder="Search by title, director, actor or genre (e.g. Nolan, Sci-Fi, Succession)…"
            aria-label="Search titles"
            className="lb-input pl-9 pr-8 text-xs sm:text-sm"
            autoComplete="off"
          />
          {filters.query && (
            <button
              onClick={() => onChange({ ...filters, query: '' })}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#667788] hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Year Filter */}
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
            className="lb-input text-xs sm:text-sm text-center"
          />
        </div>
      </div>

      {/* Filter Tabs and Data Source Attribution */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#232a33] pt-2.5">
        <div role="radiogroup" aria-label="Media category filter" className="flex items-center gap-1.5">
          {TYPES.map((t) => (
            <button
              key={t.id}
              role="radio"
              aria-checked={filters.type === t.id}
              onClick={() => onChange({ ...filters, type: t.id })}
              className={`rounded-sm px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider transition ${
                filters.type === t.id
                  ? 'bg-[#00e054] text-[#14181c]'
                  : 'bg-[#14181c] text-[#99aabb] hover:text-white border border-[#2c3440]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-[#667788]">
          <Database size={11} className="text-[#00e054]" />
          <span>4-Source Live Engine: TVMaze · iTunes · OMDb · TMDB</span>
        </div>
      </div>
    </section>
  );
}
