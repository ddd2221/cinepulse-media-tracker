import { useState } from 'react';
import { Eye, Heart, Bookmark, Film, Minus, Plus, MoreHorizontal } from 'lucide-react';
import type { MediaSummary, UserMediaItem, UserMediaPatch } from '../types/media';

export function SkeletonCard() {
  return (
    <div className="flex flex-col space-y-2" aria-hidden="true">
      <div className="skeleton aspect-[2/3] w-full rounded-md border border-white/[0.08]" />
      <div className="skeleton h-3 w-3/4 rounded" />
      <div className="skeleton h-2.5 w-1/2 rounded" />
    </div>
  );
}

interface Props {
  media: MediaSummary;
  tracked?: UserMediaItem;
  onAdd?: (m: MediaSummary, status?: UserMediaItem['status'], liked?: boolean) => void;
  onEdit?: (item: UserMediaItem) => void;
  onUpdate?: (id: string, patch: UserMediaPatch) => void;
  onRemove?: (id: string) => void;
  onToggleWatched?: (item: UserMediaItem) => void;
  onToggleLiked?: (item: UserMediaItem) => void;
  onToggleWatchlist?: (item: UserMediaItem) => void;
}

export default function MediaCard({
  media,
  tracked,
  onAdd,
  onEdit,
  onUpdate,
  onToggleWatched,
  onToggleLiked,
  onToggleWatchlist,
}: Props) {
  const [imageError, setImageError] = useState(false);

  const isWatched = tracked?.status === 'completed';
  const isLiked = Boolean(tracked?.liked);
  const isBookmarked = tracked?.status === 'plan_to_watch';
  const isWatching = tracked?.status === 'watching';
  const isSeries = media.type !== 'movie';
  const episodeCode = tracked && isSeries ? `S${String(tracked.current_season).padStart(2, '0')}E${String(tracked.current_episode).padStart(2, '0')}` : null;
  const displayRating = tracked?.rating ? `★ ${tracked.rating}` : media.rating ? `★ ${media.rating}` : null;

  const handleEyeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (tracked && onToggleWatched) {
      onToggleWatched(tracked);
    } else if (onAdd) {
      onAdd(media, 'completed', false);
    }
  };

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (tracked && onToggleLiked) {
      onToggleLiked(tracked);
    } else if (onAdd) {
      onAdd(media, 'plan_to_watch', true);
    }
  };

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (tracked && onToggleWatchlist) {
      onToggleWatchlist(tracked);
    } else if (onAdd) {
      onAdd(media, 'plan_to_watch', false);
    }
  };

  return (
    <article className="group relative flex flex-col space-y-2 transition-all duration-150">
      {/* 2:3 Poster Frame: 6px rounded, ring-1 ring-white/10, amber glow on hover */}
      <div
        className="poster-card cursor-pointer bg-[#121318]"
        onClick={() => {
          if (tracked && onEdit) onEdit(tracked);
          else if (onAdd) onAdd(media, 'plan_to_watch');
        }}
      >
        {media.poster && !imageError ? (
          <img
            src={media.poster}
            alt={`${media.title} poster`}
            loading="lazy"
            onError={() => setImageError(true)}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          /* Sleek Obsidian Fallback if image fails */
          <div className="flex h-full w-full flex-col items-center justify-between p-3 text-center bg-[#121318]">
            <Film size={22} className="text-zinc-600 mt-4" />
            <span className="font-serif text-xs font-semibold text-zinc-300 line-clamp-3 leading-tight">
              {media.title}
            </span>
            <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-500 mb-2">
              {media.type}
            </span>
          </div>
        )}

        {/* Status Indicators (Top Left) */}
        {tracked && (
          <div className="absolute top-1.5 left-1.5 flex items-center gap-1 z-10">
            {isWatched && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-zinc-950 shadow-md" title="Watched">
                <Eye size={11} strokeWidth={3} />
              </span>
            )}
            {isLiked && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-white shadow-md" title="Favorited">
                <Heart size={10} fill="currentColor" />
              </span>
            )}
            {isBookmarked && !isWatched && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-white shadow-md" title="In Vault">
                <Bookmark size={11} fill="currentColor" />
              </span>
            )}
          </div>
        )}

        {/* Monospace Rating Badge (Top Right) */}
        {displayRating && (
          <div className="absolute top-1.5 right-1.5 flex items-center rounded bg-black/80 px-1.5 py-0.5 font-mono text-[10px] font-bold text-amber-400 backdrop-blur-md border border-white/10 z-10">
            <span>{displayRating}</span>
          </div>
        )}

        {/* CinePulse Frosted Glass Bottom Dock (Revealed on Hover) */}
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/30 to-transparent p-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <div className="flex items-center justify-around rounded-md bg-[#0a0a0c]/85 p-1 backdrop-blur-md border border-white/15 shadow-xl">
            <button
              type="button"
              onClick={handleEyeClick}
              title={isWatched ? 'Watched' : 'Mark Watched'}
              className={`p-1.5 transition rounded hover:scale-110 ${
                isWatched ? 'text-emerald-400' : 'text-zinc-400 hover:text-emerald-400'
              }`}
            >
              <Eye size={14} />
            </button>

            <button
              type="button"
              onClick={handleHeartClick}
              title={isLiked ? 'Favorited' : 'Favorite'}
              className={`p-1.5 transition rounded hover:scale-110 ${
                isLiked ? 'text-rose-400' : 'text-zinc-400 hover:text-rose-400'
              }`}
            >
              <Heart size={14} fill={isLiked ? 'currentColor' : 'none'} />
            </button>

            <button
              type="button"
              onClick={handleBookmarkClick}
              title={isBookmarked ? 'In Vault' : 'Save to Vault'}
              className={`p-1.5 transition rounded hover:scale-110 ${
                isBookmarked ? 'text-indigo-400' : 'text-zinc-400 hover:text-indigo-400'
              }`}
            >
              <Bookmark size={14} fill={isBookmarked ? 'currentColor' : 'none'} />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (tracked && onEdit) onEdit(tracked);
                else if (onAdd) onAdd(media, 'plan_to_watch');
              }}
              title="Quick Log / Score"
              className="p-1.5 text-zinc-400 hover:text-amber-400 transition rounded hover:scale-110"
            >
              <MoreHorizontal size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Title & Metadata Row Underneath Poster */}
      <div className="flex flex-col space-y-0.5">
        <h3
          className="truncate text-[12px] font-medium text-zinc-200 transition group-hover:text-amber-400"
          title={media.title}
        >
          {media.title}
        </h3>

        <div className="flex items-center justify-between font-mono text-[11px] text-zinc-500">
          <span>{media.year} • {media.type === 'movie' ? 'FILM' : 'SERIES'}</span>

          {isWatching && episodeCode && onUpdate && (
            <div
              className="flex items-center gap-1 rounded bg-[#16171f] px-1 text-[10px] font-mono text-amber-400 border border-white/[0.08]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                disabled={tracked.current_episode <= 0}
                onClick={() => onUpdate(tracked.id, { current_episode: tracked.current_episode - 1 })}
                className="hover:text-white disabled:opacity-30"
              >
                <Minus size={10} />
              </button>
              <span>{episodeCode}</span>
              <button
                onClick={() => onUpdate(tracked.id, { current_episode: tracked.current_episode + 1 })}
                className="hover:text-white"
              >
                <Plus size={10} />
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
