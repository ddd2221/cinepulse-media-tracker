import { useState } from 'react';
import { Eye, Heart, Bookmark, Plus, Star, Film } from 'lucide-react';
import type { MediaSummary, UserMediaItem } from '../types/media';
import { FEATURED_HERO_BACKDROPS } from '../services/mediaAggregatorService';

interface Props {
  trackedMap: Map<string, UserMediaItem>;
  onAdd: (media: MediaSummary, status?: UserMediaItem['status'], liked?: boolean) => void;
  onEdit: (item: UserMediaItem) => void;
  onToggleWatched: (item: UserMediaItem) => void;
  onToggleLiked: (item: UserMediaItem) => void;
  onToggleWatchlist: (item: UserMediaItem) => void;
  onQuickLog: (media: MediaSummary) => void;
}

export default function FeaturedBackdropHeader({
  trackedMap,
  onAdd,
  onEdit,
  onToggleWatched,
  onToggleLiked,
  onToggleWatchlist,
  onQuickLog,
}: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const featured = FEATURED_HERO_BACKDROPS[currentIndex] ?? FEATURED_HERO_BACKDROPS[0];
  const tracked = trackedMap.get(featured.imdbID);

  const asSummary: MediaSummary = {
    imdbID: featured.imdbID,
    title: featured.title,
    year: featured.year,
    type: featured.type,
    poster: featured.posterUrl,
    backdrop: featured.backdropUrl,
    director: featured.directorOrCreator,
    rating: featured.rating,
    genres: featured.genres,
    overview: featured.synopsis,
  };

  const handleEyeClick = () => {
    if (tracked) {
      onToggleWatched(tracked);
    } else {
      onAdd(asSummary, 'completed', false);
    }
  };

  const handleHeartClick = () => {
    if (tracked) {
      onToggleLiked(tracked);
    } else {
      onAdd(asSummary, 'plan_to_watch', true);
    }
  };

  const handleBookmarkClick = () => {
    if (tracked) {
      onToggleWatchlist(tracked);
    } else {
      onAdd(asSummary, 'plan_to_watch', false);
    }
  };

  const isCompleted = tracked?.status === 'completed';
  const isLiked = Boolean(tracked?.liked);
  const isBookmarked = tracked?.status === 'plan_to_watch';

  return (
    <section aria-label="Featured Selection" className="relative -mx-4 -mt-6 sm:-mt-8 mb-10 overflow-hidden bg-[#0a0a0c]">
      {/* Cinematic widescreen backdrop with atmospheric vignette */}
      <div className="relative h-[420px] sm:h-[480px] md:h-[540px] w-full overflow-hidden">
        <img
          key={featured.id}
          src={featured.backdropUrl}
          alt={`${featured.title} backdrop`}
          loading="eager"
          decoding="async"
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover object-center filter brightness-[0.75] contrast-[1.12] transition-opacity duration-700 animate-fadeIn"
        />

        {/* Multi-layered cinematic vignette fading into obsidian #0a0a0c */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0c]/95 via-transparent to-[#0a0a0c]/80" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#0a0a0c]/20 to-[#0a0a0c]/90 pointer-events-none" />

        {/* Content Container */}
        <div className="absolute inset-0 flex flex-col justify-end px-4 sm:px-8 pb-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
            {/* Title & Metadata (Left Column) */}
            <div className="md:col-span-8 space-y-3.5">
              {/* Glassmorphic 35mm Badge & Monospace Pills */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-amber-400 backdrop-blur-md">
                  <Film size={12} className="text-amber-500" />
                  <span>35MM CURATED SELECTION</span>
                </span>

                <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px] text-zinc-400">
                  <span className="rounded bg-white/[0.06] border border-white/[0.08] px-2 py-0.5">
                    [ {featured.year} ]
                  </span>
                  <span className="rounded bg-white/[0.06] border border-white/[0.08] px-2 py-0.5 text-zinc-300">
                    [ {featured.type === 'movie' ? 'FEATURE FILM' : 'SERIES'} ]
                  </span>
                  {featured.rating && (
                    <span className="flex items-center gap-1 rounded bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-amber-400 font-semibold">
                      <Star size={11} fill="currentColor" />
                      <span>★ {featured.rating} IMDb</span>
                    </span>
                  )}
                  <span className="hidden sm:inline rounded bg-white/[0.06] border border-white/[0.08] px-2 py-0.5 text-zinc-400">
                    [ {featured.genres.slice(0, 2).join(' / ').toUpperCase()} ]
                  </span>
                </div>
              </div>

              {/* Bold Editorial Serif Title */}
              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white drop-shadow-md">
                {featured.title}
              </h1>

              {/* Director Attribution */}
              <p className="font-sans text-xs sm:text-sm text-zinc-400">
                {featured.type === 'movie' ? 'Directed by' : 'Created by'}{' '}
                <span className="text-zinc-100 font-semibold">{featured.directorOrCreator}</span>
              </p>

              {/* Tagline */}
              {featured.tagline && (
                <p className="italic text-xs sm:text-sm text-amber-200/90 font-serif line-clamp-1 border-l-2 border-amber-500/80 pl-3">
                  &ldquo;{featured.tagline}&rdquo;
                </p>
              )}

              {/* Synopsis */}
              <p className="hidden sm:block text-xs sm:text-sm text-zinc-400 max-w-2xl line-clamp-2 leading-relaxed">
                {featured.synopsis}
              </p>

              {/* Dark-Glass Action Pills Row */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-2">
                <button
                  onClick={handleEyeClick}
                  title={isCompleted ? 'Marked as Watched' : 'Mark Watched'}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-semibold backdrop-blur-md transition ${
                    isCompleted
                      ? 'border border-emerald-500/50 bg-emerald-500 text-zinc-950 font-bold'
                      : 'border border-white/15 bg-white/[0.08] text-zinc-200 hover:border-emerald-400 hover:text-emerald-400'
                  }`}
                >
                  <Eye size={14} />
                  <span>{isCompleted ? 'Watched' : 'Watch'}</span>
                </button>

                <button
                  onClick={handleHeartClick}
                  title={isLiked ? 'Favorited' : 'Add to Favorites'}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-semibold backdrop-blur-md transition ${
                    isLiked
                      ? 'border border-rose-500/50 bg-rose-500 text-white font-bold'
                      : 'border border-white/15 bg-white/[0.08] text-zinc-200 hover:border-rose-400 hover:text-rose-400'
                  }`}
                >
                  <Heart size={14} fill={isLiked ? 'currentColor' : 'none'} />
                  <span>{isLiked ? 'Favorited' : 'Favorite'}</span>
                </button>

                <button
                  onClick={handleBookmarkClick}
                  title={isBookmarked ? 'In Vault' : 'Save to Vault'}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-semibold backdrop-blur-md transition ${
                    isBookmarked
                      ? 'border border-indigo-500/50 bg-indigo-500 text-white font-bold'
                      : 'border border-white/15 bg-white/[0.08] text-zinc-200 hover:border-indigo-400 hover:text-indigo-400'
                  }`}
                >
                  <Bookmark size={14} fill={isBookmarked ? 'currentColor' : 'none'} />
                  <span>{isBookmarked ? 'In Vault' : 'Save'}</span>
                </button>

                <button
                  onClick={() => {
                    if (tracked) onEdit(tracked);
                    else onQuickLog(asSummary);
                  }}
                  className="btn-amber"
                >
                  <Plus size={14} strokeWidth={2.5} />
                  <span>{tracked ? 'Edit Entry' : 'Log / Rate'}</span>
                </button>
              </div>
            </div>

            {/* 7-Title Carousel Switcher (Right Column) */}
            <div className="md:col-span-4 flex flex-col items-start md:items-end justify-end space-y-2">
              <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-zinc-500">
                ARCHIVE SPOTLIGHT [{currentIndex + 1} / {FEATURED_HERO_BACKDROPS.length}]
              </span>
              <div className="flex gap-2 overflow-x-auto pb-1 max-w-full">
                {FEATURED_HERO_BACKDROPS.map((item, idx) => (
                  <button
                    key={item.id}
                    onClick={() => setCurrentIndex(idx)}
                    title={item.title}
                    className={`relative shrink-0 w-12 sm:w-14 aspect-[2/3] rounded-md overflow-hidden transition-all duration-200 ${
                      currentIndex === idx
                        ? 'ring-2 ring-amber-400 scale-105 shadow-lg shadow-black'
                        : 'opacity-40 hover:opacity-90 ring-1 ring-white/10'
                    }`}
                  >
                    <img
                      src={item.posterUrl}
                      alt={item.title}
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
