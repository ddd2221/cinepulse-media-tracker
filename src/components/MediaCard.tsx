import { Check, Minus, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import type { MediaSummary, UserMediaItem, UserMediaPatch } from '../types/media';
import { STATUS_LABELS } from '../types/media';

const GRADIENTS = [
  'from-rose-600/70 to-indigo-900', 'from-teal-500/60 to-slate-900', 'from-amber-500/60 to-rose-900',
  'from-violet-600/70 to-slate-900', 'from-sky-500/60 to-indigo-900', 'from-emerald-500/60 to-slate-900',
];

const hash = (s: string) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

export function Poster({ title, poster, type }: { title: string; poster: string | null; type: string }) {
  if (poster) {
    return <img src={poster} alt={`${title} poster`} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />;
  }
  return (
    <div className={`flex h-full w-full flex-col items-center justify-center bg-gradient-to-br p-4 text-center ${GRADIENTS[hash(title) % GRADIENTS.length]}`}>
      <span className="text-4xl font-extrabold text-white/90">{title.split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase()}</span>
      <span className="mt-2 text-[10px] font-semibold uppercase tracking-widest text-white/50">{type}</span>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-xl border border-white/5 bg-ink-800" aria-hidden="true">
      <div className="skeleton aspect-[2/3]" />
      <div className="space-y-2 p-3">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/3 rounded" />
      </div>
    </div>
  );
}

interface Props {
  media: MediaSummary;
  tracked?: UserMediaItem;
  onAdd?: (m: MediaSummary) => void;
  onEdit?: (item: UserMediaItem) => void;
  onUpdate?: (id: string, patch: UserMediaPatch) => void;
  onRemove?: (id: string) => void;
}

export default function MediaCard({ media, tracked, onAdd, onEdit, onUpdate, onRemove }: Props) {
  const isSeries = media.type !== 'movie';
  const code = tracked && isSeries ? `S${String(tracked.current_season).padStart(2, '0')}E${String(tracked.current_episode).padStart(2, '0')}` : null;

  return (
    <article className="group animate-fadeUp overflow-hidden rounded-xl border border-white/5 bg-ink-800 transition hover:-translate-y-1 hover:border-pulse-500/40 hover:shadow-xl hover:shadow-pulse-500/10">
      <div className="relative aspect-[2/3] overflow-hidden">
        <Poster title={media.title} poster={media.poster} type={media.type} />
        <span className="absolute left-2 top-2 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur">{media.type}</span>
        {tracked?.rating && (
          <span className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-black/60 px-2 py-0.5 text-xs font-bold text-amber-400 backdrop-blur">
            <Star size={12} fill="currentColor" /> {tracked.rating}
          </span>
        )}
        {tracked && (
          <span className="absolute bottom-2 left-2 rounded-md bg-neon-500/90 px-2 py-0.5 text-[11px] font-bold text-ink-950">{STATUS_LABELS[tracked.status]}</span>
        )}
      </div>

      <div className="space-y-2 p-3">
        <div>
          <h3 className="line-clamp-1 text-sm font-semibold text-white" title={media.title}>{media.title}</h3>
          <p className="text-xs text-slate-500">{media.year}</p>
        </div>

        {tracked && code && tracked.status === 'watching' && onUpdate && (
          <div className="flex items-center justify-between rounded-lg bg-ink-900 px-2 py-1">
            <button
              className="rounded p-1 text-slate-400 hover:text-white disabled:opacity-30"
              aria-label="Previous episode"
              disabled={tracked.current_episode <= 0}
              onClick={() => onUpdate(tracked.id, { current_episode: tracked.current_episode - 1 })}
            ><Minus size={14} /></button>
            <span className="font-mono text-xs font-semibold text-neon-400" aria-live="polite">{code}</span>
            <button
              className="rounded p-1 text-slate-400 hover:text-white"
              aria-label="Next episode"
              onClick={() => onUpdate(tracked.id, { current_episode: tracked.current_episode + 1 })}
            ><Plus size={14} /></button>
          </div>
        )}

        <div className="flex gap-2">
          {tracked ? (
            <>
              <button className="btn-ghost flex-1 !px-2 !py-1.5 text-xs" onClick={() => onEdit?.(tracked)}><Pencil size={13} /> Edit</button>
              <button className="btn-ghost !px-2 !py-1.5 text-xs hover:!text-pulse-400" onClick={() => onRemove?.(tracked.id)} aria-label={`Remove ${media.title}`}><Trash2 size={13} /></button>
            </>
          ) : (
            <button className="btn-primary flex-1 !py-1.5 text-xs" onClick={() => onAdd?.(media)}><Plus size={14} /> Add to list</button>
          )}
          {tracked && !onEdit && <Check size={14} className="text-neon-400" />}
        </div>
      </div>
    </article>
  );
}
