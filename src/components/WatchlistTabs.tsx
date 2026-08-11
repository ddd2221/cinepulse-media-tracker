import type { UserMediaItem, WatchStatus } from '../types/media';
import { STATUS_LABELS, WATCH_STATUSES } from '../types/media';

export type TabId = WatchStatus | 'all';

interface Props {
  active: TabId;
  onChange: (t: TabId) => void;
  items: UserMediaItem[];
}

export default function WatchlistTabs({ active, onChange, items }: Props) {
  const tabs: { id: TabId; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: items.length },
    ...WATCH_STATUSES.map((s) => ({ id: s as TabId, label: STATUS_LABELS[s], count: items.filter((i) => i.status === s).length })),
  ];

  const onKey = (e: React.KeyboardEvent, index: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const next = (index + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    onChange(tabs[next].id);
    (e.currentTarget.parentElement?.children[next] as HTMLElement | undefined)?.focus();
  };

  return (
    <div role="tablist" aria-label="Watchlist status" className="flex gap-2 overflow-x-auto pb-1">
      {tabs.map((t, i) => (
        <button
          key={t.id}
          role="tab"
          id={`tab-${t.id}`}
          aria-selected={active === t.id}
          tabIndex={active === t.id ? 0 : -1}
          onKeyDown={(e) => onKey(e, i)}
          onClick={() => onChange(t.id)}
          className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
            active === t.id ? 'bg-pulse-500 text-white shadow-lg shadow-pulse-500/20' : 'bg-white/5 text-slate-300 hover:bg-white/10'
          }`}
        >
          {t.label}
          <span className={`rounded-full px-2 text-xs ${active === t.id ? 'bg-white/20' : 'bg-white/10 text-slate-400'}`}>{t.count}</span>
        </button>
      ))}
    </div>
  );
}
