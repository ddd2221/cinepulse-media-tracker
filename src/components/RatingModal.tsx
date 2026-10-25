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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="log-dialog-title"
        className="relative w-full max-w-lg rounded-lg border border-white/[0.12] bg-[#121318] p-6 shadow-2xl animate-fadeUp max-h-[92vh] overflow-y-auto"
      >
        {/* Top Header */}
        <div className="mb-5 flex items-start justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3.5">
            {item.poster && (
              <img
                src={item.poster}
                alt={item.title}
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                className="h-16 w-11 object-cover rounded-md border border-white/[0.1] shadow"
              />
            )}
            <div>
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-amber-500">
                ARCHIVE ENTRY
              </span>
              <h2 id="log-dialog-title" className="font-serif text-xl font-bold text-white leading-tight">
                {item.title}
              </h2>
              <p className="font-mono text-xs text-zinc-400">
                {item.year} • {item.media_type === 'movie' ? 'FILM' : 'SERIES'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1.5 text-zinc-500 hover:bg-white/[0.08] hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Status & Favorites */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-5">
          <div>
            <label htmlFor="log-status" className="mb-1.5 block font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Tracking Status
            </label>
            <select
              id="log-status"
              className="input-obsidian text-xs font-sans"
              value={status}
              onChange={(e) => setStatus(e.target.value as WatchStatus)}
            >
              {WATCH_STATUSES.map((s) => (
                <option key={s} value={s} className="bg-[#121318]">
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <span className="mb-1.5 block font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Personal Favorite
            </span>
            <button
              type="button"
              onClick={() => setLiked(!liked)}
              className={`flex w-full items-center justify-center gap-2 rounded-md border px-3 py-2 text-xs font-semibold transition ${
                liked
                  ? 'border-rose-500/50 bg-rose-500/10 text-rose-400'
                  : 'border-white/[0.08] bg-[#0a0a0c] text-zinc-400 hover:border-rose-500/40 hover:text-rose-400'
              }`}
            >
              <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
              <span>{liked ? 'Added to Favorites' : 'Add to Favorites'}</span>
            </button>
          </div>
        </div>

        {/* Season & Episode progress for TV Shows */}
        {isSeries && (
          <div className="mb-5 grid grid-cols-2 gap-3 rounded-md border border-white/[0.08] bg-[#0a0a0c] p-3">
            <div>
              <label htmlFor="log-season" className="mb-1 block font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Season
              </label>
              <input
                id="log-season"
                type="number"
                min={1}
                className="input-obsidian text-xs text-center font-mono"
                value={season}
                onChange={(e) => setSeason(Number(e.target.value))}
              />
            </div>
            <div>
              <label htmlFor="log-episode" className="mb-1 block font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Episode
              </label>
              <input
                id="log-episode"
                type="number"
                min={0}
                className="input-obsidian text-xs text-center font-mono"
                value={episode}
                onChange={(e) => setEpisode(Number(e.target.value))}
              />
            </div>
          </div>
        )}

        {/* 10-Star Rating (Amber Gold Stars) */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Rating {rating ? `— ★ ${rating} / 10` : '— Unrated'}
            </span>
            {rating && (
              <button
                type="button"
                onClick={() => setRating(null)}
                className="font-mono text-[10px] text-zinc-500 hover:text-rose-400 transition"
              >
                Clear score
              </button>
            )}
          </div>

          <div role="radiogroup" aria-label="1 to 10 star rating" className="flex items-center justify-between bg-[#0a0a0c] p-2.5 rounded-md border border-white/[0.08]">
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
                    isFilled ? 'text-amber-400' : 'text-zinc-700 hover:text-amber-400/60'
                  }`}
                >
                  <Star size={18} fill={isFilled ? 'currentColor' : 'none'} strokeWidth={isFilled ? 0 : 2} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Notes / Critique */}
        <div className="mb-6">
          <label htmlFor="log-notes" className="mb-1.5 block font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            Critique / Personal Notes
          </label>
          <textarea
            id="log-notes"
            rows={3}
            maxLength={2000}
            className="input-obsidian resize-none text-xs leading-relaxed"
            placeholder="Record your thoughts, standout performances, cinematography notes…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between border-t border-white/[0.08] pt-4">
          {onRemove ? (
            <button
              type="button"
              onClick={() => {
                onRemove(item.id);
                onClose();
              }}
              className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-rose-400 transition"
            >
              <Trash2 size={13} />
              <span>Remove from Vault</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2.5">
            <button type="button" className="btn-glass" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="btn-amber" onClick={save}>
              Save Entry
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
