import { Heart } from 'lucide-react';
import type { UserMediaItem, WatchStatus } from '../types/media';
import { STATUS_LABELS } from '../types/media';

export type TabId = WatchStatus | 'all' | 'liked';

interface Props {
  active: TabId;
  onChange: (t: TabId) => void;
  items: UserMediaItem[];
}

export default function WatchlistTabs({ active, onChange, items }: Props) {
  const likedCount = items.filter((i) => i.liked).length;

  const tabs: { id: TabId; label: string; count: number; icon?: typeof Heart }[] = [
    { id: 'all', label: 'All Diary', count: items.length },
    { id: 'completed', label: STATUS_LABELS.completed, count: items.filter((i) => i.status === 'completed').length },
    { id: 'watching', label: STATUS_LABELS.watching, count: items.filter((i) => i.status === 'watching').length },
    { id: 'plan_to_watch', label: STATUS_LABELS.plan_to_watch, count: items.filter((i) => i.status === 'plan_to_watch').length },
    { id: 'liked', label: 'Liked', count: likedCount, icon: Heart },
    { id: 'dropped', label: STATUS_LABELS.dropped, count: items.filter((i) => i.status === 'dropped').length },
  ];

  return (
    <div role="tablist" aria-label="Watchlist categories" className="flex items-center gap-1.5 overflow-x-auto pb-1">
      {tabs.map((t) => {
        const Icon = t.icon;
        const isActive = active === t.id;

        return (
          <button
            key={t.id}
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={isActive}
            onClick={() => onChange(t.id)}
            className={`flex shrink-0 items-center gap-1.5 rounded-sm px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
              isActive
                ? 'bg-[#00e054] text-[#14181c] shadow-sm'
                : 'border border-[#2c3440] bg-[#1f252c] text-[#99aabb] hover:border-[#455566] hover:text-white'
            }`}
          >
            {Icon && <Icon size={12} fill={isActive ? '#14181c' : '#ff8000'} className={isActive ? 'text-[#14181c]' : 'text-[#ff8000]'} />}
            <span>{t.label}</span>
            <span
              className={`rounded-[2px] px-1 text-[10px] ${
                isActive ? 'bg-[#14181c]/20 text-[#14181c] font-black' : 'bg-[#14181c] text-[#667788]'
              }`}
            >
              {t.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
