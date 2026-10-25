import { useState } from 'react';
import { Eye, Heart, Clock, Film, Minus, Plus, MoreHorizontal } from 'lucide-react';
import type { MediaSummary, UserMediaItem, UserMediaPatch } from '../types/media';

export function SkeletonCard() {
  return (
    <div className="flex flex-col space-y-1.5" aria-hidden="true">
      <div className="skeleton aspect-[2/3] w-full rounded-[3px] border border-[#2c3440]" />
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
  const isWatchlist = tracked?.status === 'plan_to_watch';
  const isWatching = tracked?.status === 'watching';
  const isSeries = media.type !== 'movie';
  const episodeCode = tracked && isSeries ? `S${String(tracked.current_season).padStart(2, '0')}E${String(tracked.current_episode).padStart(2, '0')}` : null;

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

  const handleClockClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (tracked && onToggleWatchlist) {
      onToggleWatchlist(tracked);
    } else if (onAdd) {
      onAdd(media, 'plan_to_watch', false);
    }
  };

  return (
    <article className="group relative flex flex-col space-y-1.5 transition-all duration-150">
      {/* 2:3 Poster Frame with crisp 1px border and Letterboxd Green hover ring */}
      <div
        className="lb-poster cursor-pointer bg-[#1f252c]"
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
          /* Elegant slate fallback when no image - NO giant neon initials */
          <div className="flex h-full w-full flex-col items-center justify-between p-3 text-center bg-[#1f252c]">
            <Film size={22} className="text-[#667788] mt-4" />
            <span className="font-serif text-xs font-semibold text-slate-300 line-clamp-3 leading-tight">
              {media.title}
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#667788] mb-2">
              {media.type}
            </span>
          </div>
        )}

        {/* Permanent Badges on Poster (Letterboxd Style) */}
        {tracked && (
          <div className="absolute top-1.5 left-1.5 flex items-center gap-1">
            {isWatched && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#00e054] text-[#14181c] shadow" title="Watched">
                <Eye size={12} strokeWidth={3} />
              </span>
            )}
            {isLiked && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#ff8000] text-white shadow" title="Liked">
                <Heart size={11} fill="currentColor" />
              </span>
            )}
            {isWatchlist && !isWatched && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#40bcf4] text-[#14181c] shadow" title="In Watchlist">
                <Clock size={12} strokeWidth={3} />
              </span>
            )}
          </div>
        )}

        {/* User Rating Badge (Top Right) */}
        {tracked?.rating && (
          <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 rounded-[2px] bg-black/80 px-1.5 py-0.5 text-[11px] font-bold text-[#00e054] backdrop-blur-sm">
            <span>★</span>
            <span>{tracked.rating}</span>
          </div>
        )}

        {/* HOVER OVERLAY (Letterboxd Action Panel) */}
        <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-black/90 via-black/40 to-transparent p-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <div className="flex justify-end">
            <span className="rounded-[2px] bg-black/70 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#99aabb]">
              {media.type === 'movie' ? 'FILM' : 'SERIES'}
            </span>
          </div>

          <div className="space-y-1.5">
            {/* Action Bar: Eye (Watch), Heart (Like), Clock (Watchlist), Edit */}
            <div className="flex items-center justify-around rounded-[3px] bg-[#14181c]/90 p-1 backdrop-blur-md border border-[#2c3440]">
              <button
                type="button"
                onClick={handleEyeClick}
                title={isWatched ? 'Watched' : 'Mark Watched'}
                className={`p-1 transition rounded hover:scale-110 ${
                  isWatched ? 'text-[#00e054]' : 'text-[#99aabb] hover:text-white'
                }`}
              >
                <Eye size={15} />
              </button>

              <button
                type="button"
                onClick={handleHeartClick}
                title={isLiked ? 'Liked' : 'Like'}
                className={`p-1 transition rounded hover:scale-110 ${
                  isLiked ? 'text-[#ff8000]' : 'text-[#99aabb] hover:text-[#ff8000]'
                }`}
              >
                <Heart size={14} fill={isLiked ? 'currentColor' : 'none'} />
              </button>

              <button
                type="button"
                onClick={handleClockClick}
                title={isWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
                className={`p-1 transition rounded hover:scale-110 ${
                  isWatchlist ? 'text-[#40bcf4]' : 'text-[#99aabb] hover:text-[#40bcf4]'
                }`}
              >
                <Clock size={14} />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (tracked && onEdit) onEdit(tracked);
                  else if (onAdd) onAdd(media, 'plan_to_watch');
                }}
                title="Log / Rate"
                className="p-1 text-[#99aabb] hover:text-[#00e054] transition rounded hover:scale-110"
              >
                <MoreHorizontal size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Title & Metadata Underneath Poster */}
      <div className="flex flex-col">
        <h3
          className="truncate text-[12px] font-semibold text-slate-200 transition group-hover:text-[#00e054]"
          title={media.title}
        >
          {media.title}
        </h3>
        <div className="flex items-center justify-between text-[11px] text-[#667788]">
          <span>{media.year}</span>
          {isWatching && episodeCode && onUpdate && (
            <div
              className="flex items-center gap-1 rounded bg-[#1f252c] px-1 text-[10px] font-mono text-[#00e054] border border-[#2c3440]"
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
