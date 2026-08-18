import { useEffect, useRef, useState } from 'react';
import { Star, X } from 'lucide-react';
import type { UserMediaItem, UserMediaPatch, WatchStatus } from '../types/media';
import { STATUS_LABELS, WATCH_STATUSES } from '../types/media';

interface Props {
  item: UserMediaItem;
  onSave: (id: string, patch: UserMediaPatch) => void;
  onClose: () => void;
}

export default function RatingModal({ item, onSave, onClose }: Props) {
  const [status, setStatus] = useState<WatchStatus>(item.status);
  const [rating, setRating] = useState<number | null>(item.rating);
  const [season, setSeason] = useState(item.current_season);
  const [episode, setEpisode] = useState(item.current_episode);
  const [notes, setNotes] = useState(item.notes);
  const dialogRef = useRef<HTMLDivElement>(null);
  const isSeries = item.media_type !== 'movie';

  // Escape to close + simple focus trap for keyboard users.
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    dialogRef.current?.querySelector<HTMLElement>('select, button, input')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && dialogRef.current) {
        const f = dialogRef.current.querySelectorAll<HTMLElement>('button, select, input, textarea');
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); previous?.focus(); };
  }, [onClose]);

  const save = () => {
    onSave(item.id, {
      status, rating, notes: notes.slice(0, 2000),
      ...(isSeries ? { current_season: Math.max(1, season), current_episode: Math.max(0, episode) } : {}),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="rating-title" className="glass animate-fadeUp max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl p-5 sm:rounded-2xl">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 id="rating-title" className="text-lg font-bold text-white">{item.title}</h2>
            <p className="text-xs text-slate-500">{item.year} · {item.media_type}</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded p-1 text-slate-400 hover:text-white"><X size={20} /></button>
        </div>

        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400" htmlFor="status-select">Status</label>
        <select id="status-select" className="input mb-4" value={status} onChange={(e) => setStatus(e.target.value as WatchStatus)}>
          {WATCH_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>

        {isSeries && (
          <div className="mb-4 grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="season" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">Season</label>
              <input id="season" type="number" min={1} className="input" value={season} onChange={(e) => setSeason(Number(e.target.value))} />
            </div>
            <div>
              <label htmlFor="episode" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">Episode</label>
              <input id="episode" type="number" min={0} className="input" value={episode} onChange={(e) => setEpisode(Number(e.target.value))} />
            </div>
          </div>
        )}

        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400" id="rating-label">Your rating {rating ? `· ${rating}/10` : ''}</p>
        <div role="radiogroup" aria-labelledby="rating-label" className="mb-4 flex flex-wrap gap-1">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} out of 10`}
              onClick={() => setRating(rating === n ? null : n)}
              className={`grid h-9 w-9 place-items-center rounded-lg transition ${rating !== null && n <= rating ? 'text-amber-400' : 'text-slate-600 hover:text-slate-400'}`}
            >
              <Star size={22} fill={rating !== null && n <= rating ? 'currentColor' : 'none'} />
            </button>
          ))}
        </div>

        <label htmlFor="notes" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">Notes</label>
        <textarea id="notes" rows={3} maxLength={2000} className="input mb-5 resize-none" placeholder="Your thoughts…" value={notes} onChange={(e) => setNotes(e.target.value)} />

        <div className="flex justify-end gap-2">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={save}>Save changes</button>
        </div>
      </div>
    </div>
  );
}
