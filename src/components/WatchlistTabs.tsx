import { Heart, Check, Clock, Bookmark, XCircle } from 'lucide-react';
import type { UserMediaItem, WatchStatus } from '../types/media';

export type TabId = WatchStatus | 'all' | 'liked';

interface Props {
  active: TabId;
  onChange: (t: TabId) => void;
  items: UserMediaItem[];
}

export default function WatchlistTabs({ active, onChange, items }: Props) {
  const likedCount = items.filter((i) => i.liked).length;

  const tabs: {
    id: TabId;
    label: string;
    count: number;
    icon?: typeof Heart;
    badgeColor?: string;
  }[] = [
    { id: 'all', label: 'All Vault', count: items.length },
    { id: 'completed', label: 'Completed', count: items.filter((i) => i.status === 'completed').length, icon: Check, badgeColor: 'text-emerald-400' },
    { id: 'watching', label: 'Watching', count: items.filter((i) => i.status === 'watching').length, icon: Clock, badgeColor: 'text-amber-400' },
    { id: 'plan_to_watch', label: 'Watchlist', count: items.filter((i) => i.status === 'plan_to_watch').length, icon: Bookmark, badgeColor: 'text-indigo-400' },
    { id: 'liked', label: 'Favorites', count: likedCount, icon: Heart, badgeColor: 'text-rose-400' },
    { id: 'dropped', label: 'Dropped', count: items.filter((i) => i.status === 'dropped').length, icon: XCircle, badgeColor: 'text-zinc-500' },
  ];

  return (
    <div role="tablist" aria-label="Vault categories" className="flex items-center gap-2 overflow-x-auto pb-1">
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
            className={`flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 font-sans text-xs font-semibold transition ${
              isActive
                ? 'bg-amber-500 text-zinc-950 font-bold shadow-sm shadow-amber-500/20'
                : 'border border-white/[0.08] bg-[#121318] text-zinc-300 hover:border-white/20 hover:text-white'
            }`}
          >
            {Icon && (
              <Icon
                size={12}
                className={isActive ? 'text-zinc-950' : t.badgeColor || 'text-zinc-400'}
                fill={t.id === 'liked' && !isActive ? 'currentColor' : 'none'}
              />
            )}
            <span>{t.label}</span>
            <span
              className={`font-mono text-[10px] rounded px-1.5 py-0.2 ${
                isActive ? 'bg-black/20 text-zinc-950 font-bold' : 'bg-[#181920] text-zinc-400 border border-white/[0.04]'
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
