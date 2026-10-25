import { LogIn, LogOut, Search, Plus, User } from 'lucide-react';
import type { AppUser } from '../types/media';

export type View = 'explore' | 'movies' | 'tv' | 'vault' | 'analytics';

interface Props {
  view: View;
  onViewChange: (v: View) => void;
  user: AppUser | null;
  onSignInClick: () => void;
  onSignOut: () => void;
  listCount: number;
  onOpenLog: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export default function Navbar({
  view,
  onViewChange,
  user,
  onSignInClick,
  onSignOut,
  listCount,
  onOpenLog,
  searchQuery,
  onSearchChange,
}: Props) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#0a0a0c]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        {/* CinePulse Brand Mark: Geometric Aperture + ARCHIVE badge */}
        <div className="flex items-center gap-7">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onViewChange('explore');
            }}
            className="flex items-center gap-2.5 group cursor-pointer"
            aria-label="CinePulse home"
          >
            {/* Minimalist Geometric Film-Frame / Aperture Icon */}
            <div className="relative flex h-7 w-7 items-center justify-center rounded-md border border-white/[0.12] bg-[#121318] shadow-inner group-hover:border-amber-500/50 transition">
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-amber-500">
                <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.75" />
                <path d="M12 3v3M12 18v3M3 12h3M18 12h3M6.5 6.5l2.2 2.2M15.3 15.3l2.2 2.2M6.5 17.5l2.2-2.2M15.3 8.7l2.2-2.2" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" opacity="0.8" />
              </svg>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-sans text-sm font-extrabold tracking-[0.2em] text-white group-hover:text-amber-400 transition">
                CINE<span className="text-amber-500">PULSE</span>
              </span>
              <span className="font-mono text-[9px] uppercase tracking-widest text-amber-400/90 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">
                ARCHIVE
              </span>
            </div>
          </a>

          {/* Floating Editorial Navigation Tabs */}
          <nav aria-label="Primary" className="hidden md:flex items-center gap-1 text-xs">
            <button
              onClick={() => onViewChange('explore')}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                view === 'explore'
                  ? 'bg-white/[0.08] text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              Explore
            </button>
            <button
              onClick={() => onViewChange('movies')}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                view === 'movies'
                  ? 'bg-white/[0.08] text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              Movies
            </button>
            <button
              onClick={() => onViewChange('tv')}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                view === 'tv'
                  ? 'bg-white/[0.08] text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              TV Shows
            </button>
            <button
              onClick={() => onViewChange('vault')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition ${
                view === 'vault'
                  ? 'bg-white/[0.08] text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <span>My Vault</span>
              {listCount > 0 && (
                <span className="font-mono text-[10px] rounded px-1.5 py-0.2 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {listCount}
                </span>
              )}
            </button>
            <button
              onClick={() => onViewChange('analytics')}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                view === 'analytics'
                  ? 'bg-white/[0.08] text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              Analytics
            </button>
          </nav>
        </div>

        {/* Right Actions: Compact Search + Amber Quick Track CTA + Session */}
        <div className="flex items-center gap-3">
          {/* Integrated Search Input */}
          <div className="relative hidden sm:block w-44 md:w-56">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" size={13} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                if (view !== 'explore' && view !== 'movies' && view !== 'tv') {
                  onViewChange('explore');
                }
              }}
              placeholder="Search archive…"
              className="w-full rounded-md border border-white/[0.08] bg-[#121318] py-1.5 pl-8 pr-2.5 text-xs text-white placeholder:text-zinc-600 focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
            />
          </div>

          {/* CinePulse Bespoke Quick Track Button */}
          <button
            onClick={onOpenLog}
            className="btn-amber"
            title="Add title to your vault"
          >
            <Plus size={14} strokeWidth={2.5} />
            <span>Add Entry</span>
          </button>

          {/* User Account / Demo Mode Pill */}
          {user ? (
            <div className="flex items-center gap-2">
              <span className="hidden lg:flex items-center gap-1.5 text-xs text-zinc-400">
                <User size={13} className="text-amber-500" />
                <span className="text-white max-w-[100px] truncate">{user.name}</span>
              </span>
              <button
                onClick={onSignOut}
                aria-label="Sign out"
                className="rounded-md border border-white/[0.08] bg-[#121318] p-1.5 text-zinc-400 hover:border-rose-500/40 hover:text-rose-400 transition"
                title="Sign out"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={onSignInClick}
              className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.08] bg-[#121318] px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:border-white/20 hover:text-white transition"
            >
              <LogIn size={13} />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Sub-Navigation */}
      <nav aria-label="Mobile Navigation" className="flex md:hidden items-center justify-around border-t border-white/[0.08] bg-[#0a0a0c] py-2 px-2 text-xs">
        <button
          onClick={() => onViewChange('explore')}
          className={`font-medium ${view === 'explore' ? 'text-amber-400' : 'text-zinc-400'}`}
        >
          Explore
        </button>
        <button
          onClick={() => onViewChange('movies')}
          className={`font-medium ${view === 'movies' ? 'text-amber-400' : 'text-zinc-400'}`}
        >
          Movies
        </button>
        <button
          onClick={() => onViewChange('tv')}
          className={`font-medium ${view === 'tv' ? 'text-amber-400' : 'text-zinc-400'}`}
        >
          TV Shows
        </button>
        <button
          onClick={() => onViewChange('vault')}
          className={`font-medium ${view === 'vault' ? 'text-amber-400' : 'text-zinc-400'}`}
        >
          My Vault
        </button>
        <button
          onClick={() => onViewChange('analytics')}
          className={`font-medium ${view === 'analytics' ? 'text-amber-400' : 'text-zinc-400'}`}
        >
          Analytics
        </button>
      </nav>
    </header>
  );
}
