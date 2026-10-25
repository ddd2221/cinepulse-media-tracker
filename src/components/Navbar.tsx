import { LogIn, LogOut, Search, Plus, User } from 'lucide-react';
import type { AppUser } from '../types/media';

export type View = 'discover' | 'films' | 'series' | 'watchlist' | 'stats';

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
    <header className="sticky top-0 z-40 border-b border-[#2c3440] bg-[#14181c]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2.5">
        {/* Brand Logo with Letterboxd 3-Color Dots */}
        <div className="flex items-center gap-6">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onViewChange('discover');
            }}
            className="flex items-center gap-2 group cursor-pointer"
            aria-label="CinePulse home"
          >
            {/* Iconic Letterboxd-style Trio Dots: Orange, Green, Blue */}
            <div className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff8000]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#00e054]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#40bcf4]" />
            </div>
            <span className="font-extrabold tracking-widest text-sm text-white group-hover:text-[#00e054] transition">
              CINE<span className="text-[#00e054]">PULSE</span>
            </span>
          </a>

          {/* Letterboxd Uppercase Tracked Navigation Links */}
          <nav aria-label="Primary" className="hidden md:flex items-center gap-1">
            <button
              onClick={() => onViewChange('discover')}
              className={`px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] transition ${
                view === 'discover' ? 'text-white' : 'text-[#99aabb] hover:text-white'
              }`}
            >
              Discover
            </button>
            <button
              onClick={() => onViewChange('films')}
              className={`px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] transition ${
                view === 'films' ? 'text-white' : 'text-[#99aabb] hover:text-white'
              }`}
            >
              Films
            </button>
            <button
              onClick={() => onViewChange('series')}
              className={`px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] transition ${
                view === 'series' ? 'text-white' : 'text-[#99aabb] hover:text-white'
              }`}
            >
              Series
            </button>
            <button
              onClick={() => onViewChange('watchlist')}
              className={`flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] transition ${
                view === 'watchlist' ? 'text-white' : 'text-[#99aabb] hover:text-white'
              }`}
            >
              <span>Watchlist</span>
              {listCount > 0 && (
                <span className="rounded-[2px] bg-[#2c3440] px-1 text-[10px] text-[#40bcf4]">
                  {listCount}
                </span>
              )}
            </button>
            <button
              onClick={() => onViewChange('stats')}
              className={`px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] transition ${
                view === 'stats' ? 'text-white' : 'text-[#99aabb] hover:text-white'
              }`}
            >
              Diary & Stats
            </button>
          </nav>
        </div>

        {/* Right Section: Compact Search, + LOG CTA, and Auth */}
        <div className="flex items-center gap-3">
          {/* Compact Integrated Search */}
          <div className="relative hidden sm:block w-44 md:w-56">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[#667788]" size={13} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                if (view !== 'discover' && view !== 'films' && view !== 'series') {
                  onViewChange('discover');
                }
              }}
              placeholder="Search films, series…"
              className="w-full rounded-sm border border-[#2c3440] bg-[#1f252c] py-1 pl-8 pr-2 text-xs text-white placeholder:text-[#667788] focus:border-[#00e054] focus:outline-none"
            />
          </div>

          {/* Letterboxd Signature + LOG CTA Button */}
          <button
            onClick={onOpenLog}
            className="lb-btn-green shadow-sm shadow-[#00e054]/20"
            title="Log a film or series"
          >
            <Plus size={14} strokeWidth={3} />
            <span>LOG</span>
          </button>

          {/* Profile / Demo Indicator */}
          {user ? (
            <div className="flex items-center gap-2">
              <span className="hidden lg:flex items-center gap-1 text-[11px] font-semibold text-[#99aabb]">
                <User size={13} className="text-[#00e054]" />
                <span className="text-white max-w-[90px] truncate">{user.name}</span>
              </span>
              <button
                onClick={onSignOut}
                aria-label="Sign out"
                className="rounded-sm border border-[#2c3440] bg-[#1f252c] p-1.5 text-[#99aabb] hover:border-red-500/50 hover:text-red-400 transition"
                title="Sign out"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={onSignInClick}
              className="inline-flex items-center gap-1.5 rounded-sm border border-[#2c3440] bg-[#1f252c] px-3 py-1 text-xs font-semibold text-[#99aabb] hover:text-white hover:border-[#455566] transition"
            >
              <LogIn size={13} />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Secondary Navigation Row */}
      <nav aria-label="Mobile Navigation" className="flex md:hidden items-center justify-around border-t border-[#2c3440] bg-[#14181c] py-2 px-2">
        <button
          onClick={() => onViewChange('discover')}
          className={`text-[10px] font-bold uppercase tracking-wider ${view === 'discover' ? 'text-[#00e054]' : 'text-[#99aabb]'}`}
        >
          Discover
        </button>
        <button
          onClick={() => onViewChange('films')}
          className={`text-[10px] font-bold uppercase tracking-wider ${view === 'films' ? 'text-[#00e054]' : 'text-[#99aabb]'}`}
        >
          Films
        </button>
        <button
          onClick={() => onViewChange('series')}
          className={`text-[10px] font-bold uppercase tracking-wider ${view === 'series' ? 'text-[#00e054]' : 'text-[#99aabb]'}`}
        >
          Series
        </button>
        <button
          onClick={() => onViewChange('watchlist')}
          className={`text-[10px] font-bold uppercase tracking-wider ${view === 'watchlist' ? 'text-[#00e054]' : 'text-[#99aabb]'}`}
        >
          Watchlist
        </button>
        <button
          onClick={() => onViewChange('stats')}
          className={`text-[10px] font-bold uppercase tracking-wider ${view === 'stats' ? 'text-[#00e054]' : 'text-[#99aabb]'}`}
        >
          Stats
        </button>
      </nav>
    </header>
  );
}
