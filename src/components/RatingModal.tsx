import { useEffect, useRef, useState } from 'react';
import { Heart, Star, Trash2, X } from 'lucide-react';
import type { UserMediaItem, UserMediaPatch, WatchStatus } from '../types/media';
import { STATUS_LABELS, WATCH_STATUSES } from '../types/media';

interface Props {
  item: UserMediaItem;
  onSave: (id: string, patch: UserMediaPatch) => void;
  onRemove?: (id: string) => void;
  onClose: () => void;
}

export default function RatingModal({ item, onSave, onRemove, onClose }: Props) {
  const [status, setStatus] = useState<WatchStatus>(item.status);
  const [rating, setRating] = useState<number | null>(item.rating);
  const [liked, setLiked] = useState<boolean>(Boolean(item.liked));
  const [season, setSeason] = useState(item.current_season);
  const [episode, setEpisode] = useState(item.current_episode);
  const [notes, setNotes] = useState(item.notes);
  const dialogRef = useRef<HTMLDivElement>(null);
  const isSeries = item.media_type !== 'movie';

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    dialogRef.current?.querySelector<HTMLElement>('button, input, select')?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>('button, select, input, textarea');
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      previous?.focus();
    };
  }, [onClose]);

  const save = () => {
    onSave(item.id, {
      status,
      rating,
      liked,
      notes: notes.slice(0, 2000),
      ...(isSeries ? { current_season: Math.max(1, season), current_episode: Math.max(0, episode) } : {}),
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="log-dialog-title"
        className="relative w-full max-w-lg rounded-sm border border-[#2c3440] bg-[#1f252c] p-5 shadow-2xl animate-fadeUp max-h-[92vh] overflow-y-auto"
      >
        {/* Top Header Bar */}
        <div className="mb-4 flex items-start justify-between border-b border-[#2c3440] pb-3">
          <div className="flex items-center gap-3">
            {item.poster && (
              <img
                src={item.poster}
                alt={item.title}
                className="h-14 w-10 object-cover rounded-[2px] border border-[#2c3440] shadow"
              />
            )}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#00e054]">
                LOG / REVIEW
              </span>
              <h2 id="log-dialog-title" className="font-serif text-lg font-bold text-white leading-tight">
                {item.title}
              </h2>
              <p className="text-xs text-[#99aabb]">
                {item.year} · {item.media_type === 'movie' ? 'Film' : 'Series'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-sm p-1 text-[#667788] hover:bg-[#2c3440] hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Status & Like Toggle */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div>
            <label htmlFor="log-status" className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-[#99aabb]">
              Status
            </label>
            <select
              id="log-status"
              className="lb-input text-xs"
              value={status}
              onChange={(e) => setStatus(e.target.value as WatchStatus)}
            >
              {WATCH_STATUSES.map((s) => (
                <option key={s} value={s} className="bg-[#1f252c]">
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-[#99aabb]">
              Like (Favorite)
            </span>
            <button
              type="button"
              onClick={() => setLiked(!liked)}
              className={`flex w-full items-center justify-center gap-2 rounded-sm border px-3 py-2 text-xs font-bold uppercase tracking-wider transition ${
                liked
                  ? 'border-[#ff8000] bg-[#ff8000]/10 text-[#ff8000]'
                  : 'border-[#2c3440] bg-[#14181c] text-[#99aabb] hover:border-[#ff8000] hover:text-[#ff8000]'
              }`}
            >
              <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
              <span>{liked ? 'Liked' : 'Like this'}</span>
            </button>
          </div>
        </div>

        {/* Season & Episode progress for TV Shows */}
        {isSeries && (
          <div className="mb-4 grid grid-cols-2 gap-3 rounded-sm border border-[#2c3440] bg-[#14181c] p-3">
            <div>
              <label htmlFor="log-season" className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#99aabb]">
                Season
              </label>
              <input
                id="log-season"
                type="number"
                min={1}
                className="lb-input text-xs text-center"
                value={season}
                onChange={(e) => setSeason(Number(e.target.value))}
              />
            </div>
            <div>
              <label htmlFor="log-episode" className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#99aabb]">
                Episode
              </label>
              <input
                id="log-episode"
                type="number"
                min={0}
                className="lb-input text-xs text-center"
                value={episode}
                onChange={(e) => setEpisode(Number(e.target.value))}
              />
            </div>
          </div>
        )}

        {/* 10-Star Rating (Green Stars / Letterboxd style) */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#99aabb]">
              Rating {rating ? `— ${rating} / 10` : '— Not Rated'}
            </span>
            {rating && (
              <button
                type="button"
                onClick={() => setRating(null)}
                className="text-[10px] text-[#667788] hover:text-red-400"
              >
                Clear rating
              </button>
            )}
          </div>

          <div role="radiogroup" aria-label="1 to 10 star rating" className="flex items-center justify-between bg-[#14181c] p-2 rounded-sm border border-[#2c3440]">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
              const isFilled = rating !== null && n <= rating;
              return (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={rating === n}
                  aria-label={`${n} of 10 stars`}
                  onClick={() => setRating(rating === n ? null : n)}
                  className={`p-1 transition hover:scale-125 ${
                    isFilled ? 'text-[#00e054]' : 'text-[#2c3440] hover:text-[#00e054]/60'
                  }`}
                >
                  <Star size={18} fill={isFilled ? 'currentColor' : 'none'} strokeWidth={isFilled ? 0 : 2} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Notes / Review */}
        <div className="mb-5">
          <label htmlFor="log-notes" className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-[#99aabb]">
            Review / Diary Notes
          </label>
          <textarea
            id="log-notes"
            rows={3}
            maxLength={2000}
            className="lb-input resize-none text-xs leading-relaxed"
            placeholder="Write your review or notes on this film or season…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between border-t border-[#2c3440] pt-3">
          {onRemove ? (
            <button
              type="button"
              onClick={() => {
                onRemove(item.id);
                onClose();
              }}
              className="inline-flex items-center gap-1.5 text-xs text-[#667788] hover:text-red-400 transition"
            >
              <Trash2 size={13} />
              <span>Remove from Diary</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button type="button" className="lb-btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="lb-btn-green" onClick={save}>
              Save Log
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
