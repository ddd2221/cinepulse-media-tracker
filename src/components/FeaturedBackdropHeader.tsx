import { useState } from 'react';
import { Eye, Heart, Clock, Plus, Star, Film } from 'lucide-react';
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

  const handleClockClick = () => {
    if (tracked) {
      onToggleWatchlist(tracked);
    } else {
      onAdd(asSummary, 'plan_to_watch', false);
    }
  };

  return (
    <section aria-label="Featured Film" className="relative -mx-4 -mt-6 sm:-mt-8 mb-8 overflow-hidden bg-[#14181c]">
      {/* Cinematic wide backdrop with multiple layer vignette fades */}
      <div className="relative h-[380px] sm:h-[460px] md:h-[520px] w-full overflow-hidden">
        <img
          key={featured.id}
          src={featured.backdropUrl}
          alt={`${featured.title} backdrop`}
          className="h-full w-full object-cover object-center filter brightness-[0.8] contrast-[1.08] transition-opacity duration-700 animate-fadeIn"
        />

        {/* Bottom-to-top Letterboxd slate gradient fade */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#14181c] via-[#14181c]/70 to-transparent" />

        {/* Side vignette gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#14181c]/90 via-transparent to-[#14181c]/70" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#14181c]/30 to-[#14181c]/80 pointer-events-none" />

        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end px-4 sm:px-8 pb-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
            {/* Title & Metadata (Left Column) */}
            <div className="md:col-span-8 space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#99aabb]">
                <span className="flex items-center gap-1.5 text-[#00e054]">
                  <Film size={13} /> FEATURED CINEMA
                </span>
                <span>•</span>
                <span>{featured.type === 'movie' ? 'FILM' : 'SERIES'}</span>
                <span>•</span>
                <span className="text-white">{featured.year}</span>
                {featured.rating && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-[#ffc000]">
                      <Star size={12} fill="currentColor" /> {featured.rating}
                    </span>
                  </>
                )}
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white drop-shadow-md">
                {featured.title}
              </h1>

              <p className="text-xs sm:text-sm font-medium tracking-wide text-[#99aabb]">
                {featured.type === 'movie' ? 'Directed by' : 'Created by'}{' '}
                <span className="text-white font-semibold">{featured.directorOrCreator}</span>
              </p>

              {featured.tagline && (
                <p className="italic text-xs sm:text-sm text-slate-300 font-serif line-clamp-1 border-l-2 border-[#00e054] pl-2.5">
                  &ldquo;{featured.tagline}&rdquo;
                </p>
              )}

              <p className="hidden sm:block text-xs sm:text-sm text-[#99aabb] max-w-2xl line-clamp-2 leading-relaxed">
                {featured.synopsis}
              </p>

              {/* Action Buttons Row */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-2">
                <button
                  onClick={handleEyeClick}
                  title={tracked?.status === 'completed' ? 'Marked as watched' : 'Mark watched'}
                  className={`inline-flex items-center gap-1.5 rounded-sm px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
                    tracked?.status === 'completed'
                      ? 'bg-[#00e054] text-[#14181c]'
                      : 'border border-[#2c3440] bg-[#1f252c]/90 text-white hover:border-[#00e054] hover:text-[#00e054]'
                  }`}
                >
                  <Eye size={15} />
                  <span>{tracked?.status === 'completed' ? 'Watched' : 'Watch'}</span>
                </button>

                <button
                  onClick={handleHeartClick}
                  title={tracked?.liked ? 'Liked' : 'Like'}
                  className={`inline-flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
                    tracked?.liked
                      ? 'bg-[#ff8000] text-white'
                      : 'border border-[#2c3440] bg-[#1f252c]/90 text-white hover:border-[#ff8000] hover:text-[#ff8000]'
                  }`}
                >
                  <Heart size={15} fill={tracked?.liked ? 'currentColor' : 'none'} />
                  <span>{tracked?.liked ? 'Liked' : 'Like'}</span>
                </button>

                <button
                  onClick={handleClockClick}
                  title={tracked?.status === 'plan_to_watch' ? 'In Watchlist' : 'Add to Watchlist'}
                  className={`inline-flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
                    tracked?.status === 'plan_to_watch'
                      ? 'bg-[#40bcf4] text-[#14181c]'
                      : 'border border-[#2c3440] bg-[#1f252c]/90 text-white hover:border-[#40bcf4] hover:text-[#40bcf4]'
                  }`}
                >
                  <Clock size={15} />
                  <span>Watchlist</span>
                </button>

                <button
                  onClick={() => {
                    if (tracked) onEdit(tracked);
                    else onQuickLog(asSummary);
                  }}
                  className="lb-btn-green"
                >
                  <Plus size={15} />
                  <span>{tracked ? 'Edit Log' : '+ Log / Review'}</span>
                </button>
              </div>
            </div>

            {/* Carousel Selector Thumbnails (Right Column) */}
            <div className="md:col-span-4 flex flex-col items-start md:items-end justify-end space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#667788]">
                Featured Highlights ({currentIndex + 1}/{FEATURED_HERO_BACKDROPS.length})
              </span>
              <div className="flex gap-2 overflow-x-auto pb-1 max-w-full">
                {FEATURED_HERO_BACKDROPS.map((item, idx) => (
                  <button
                    key={item.id}
                    onClick={() => setCurrentIndex(idx)}
                    title={item.title}
                    className={`relative shrink-0 w-12 sm:w-14 aspect-[2/3] rounded-[2px] overflow-hidden transition-all duration-200 ${
                      currentIndex === idx
                        ? 'ring-2 ring-[#00e054] scale-105 shadow-md shadow-black'
                        : 'opacity-50 hover:opacity-90 ring-1 ring-white/10'
                    }`}
                  >
                    <img src={item.posterUrl} alt={item.title} className="w-full h-full object-cover" />
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
