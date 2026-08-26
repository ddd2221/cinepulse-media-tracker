import { useEffect, useState, useTransition } from 'react';
import Navbar, { type View } from './components/Navbar';
import SearchBar from './components/SearchBar';
import MediaCard, { SkeletonCard } from './components/MediaCard';
import WatchlistTabs, { type TabId } from './components/WatchlistTabs';
import StatsOverview from './components/StatsOverview';
import RatingModal from './components/RatingModal';
import AuthModal from './components/AuthModal';
import { useDebounce } from './hooks/useDebounce';
import { useAuth } from './hooks/useAuth';
import { useMediaTracker } from './hooks/useMediaTracker';
import { getFeaturedMock, isOmdbConfigured, searchMedia } from './services/omdbService';
import type { MediaSummary, SearchFilters, UserMediaItem } from './types/media';
import { Film, Info, Sparkles, TrendingUp, AlertTriangle } from 'lucide-react';

export default function App() {
  const [view, setView] = useState<View>('discover');
  const [watchlistTab, setWatchlistTab] = useState<TabId>('all');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [editingItem, setEditingItem] = useState<UserMediaItem | null>(null);

  // Search state
  const [filters, setFilters] = useState<SearchFilters>({ query: '', type: 'all', year: '' });
  const debouncedFilters = useDebounce(filters, 350);
  const [searchResults, setSearchResults] = useState<MediaSummary[]>(() => getFeaturedMock());
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // Authentication & Media tracker
  const {
    user,
    backendAvailable,
    error: authError,
    continueAsGuest,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
  } = useAuth();

  const {
    items,
    stats,
    byImdbId,
    loading: trackerLoading,
    error: trackerError,
    add,
    update,
    remove,
    clearError: clearTrackerError,
  } = useMediaTracker(user);

  // Search effect
  useEffect(() => {
    const isBlank = !debouncedFilters.query.trim() && debouncedFilters.type === 'all' && !debouncedFilters.year;
    if (isBlank) {
      setSearchResults(getFeaturedMock());
      setSearchError(null);
      setSearching(false);
      return;
    }

    const controller = new AbortController();
    setSearching(true);
    setSearchError(null);

    searchMedia(debouncedFilters, controller.signal)
      .then((res) => {
        startTransition(() => {
          setSearchResults(res.results);
          if (res.error) setSearchError(res.error);
        });
      })
      .catch((err: Error) => {
        if (err.name !== 'AbortError') {
          setSearchError('Failed to fetch media results.');
        }
      })
      .finally(() => {
        setSearching(false);
      });

    return () => controller.abort();
  }, [debouncedFilters]);

  // Filter watchlist items
  const filteredWatchlist = items.filter((item) => {
    if (watchlistTab === 'all') return true;
    return item.status === watchlistTab;
  });

  const handleGuestEntry = () => {
    continueAsGuest();
    setShowAuthModal(false);
  };

  return (
    <div className="min-h-screen flex flex-col pb-16 md:pb-8">
      <Navbar
        view={view}
        onViewChange={setView}
        user={user}
        onSignInClick={() => setShowAuthModal(true)}
        onSignOut={signOut}
        listCount={items.length}
      />

      {/* Demo status & notice banner */}
      <div className="border-b border-white/5 bg-ink-900/60 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-neon-400 animate-pulse" />
            <span>
              {backendAvailable
                ? 'Supabase Cloud Connected'
                : 'Demo Mode Active · Offline & Local Storage fallback ready'}
            </span>
            {!isOmdbConfigured && (
              <span className="hidden sm:inline rounded bg-white/5 px-2 py-0.5 text-[11px] text-slate-400">
                Mock OMDb Catalogue
              </span>
            )}
          </div>
          {!user && (
            <button
              onClick={() => setShowAuthModal(true)}
              className="font-medium text-pulse-400 hover:text-pulse-500 hover:underline"
            >
              Sign in / Try Demo Mode &rarr;
            </button>
          )}
        </div>
      </div>

      {trackerError && (
        <div className="mx-auto mt-4 max-w-7xl px-4 w-full">
          <div className="flex items-center justify-between rounded-xl border border-pulse-500/30 bg-pulse-500/10 p-3 text-sm text-pulse-400">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} />
              <span>{trackerError}</span>
            </div>
            <button onClick={clearTrackerError} className="text-xs underline hover:text-white">
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl w-full flex-1 px-4 py-6 sm:py-8">
        {/* VIEW: DISCOVER */}
        {view === 'discover' && (
          <section className="space-y-6">
            <div className="relative overflow-hidden rounded-2xl glass p-6 sm:p-8 bg-gradient-to-r from-ink-900 via-ink-800 to-ink-900">
              <div className="max-w-2xl space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-pulse-500/10 px-3 py-1 text-xs font-semibold text-pulse-400 border border-pulse-500/20">
                  <Sparkles size={14} /> CinePulse Real-Time Discovery
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                  Track every film, series, and season seamlessly.
                </h1>
                <p className="text-sm sm:text-base text-slate-400">
                  Search millions of titles via OMDb, maintain personalized watchlists, monitor episode progress, and dive into your viewing analytics.
                </p>
              </div>
            </div>

            <SearchBar filters={filters} onChange={setFilters} />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp size={18} className="text-pulse-400" />
                  <h2 className="text-lg font-bold text-white">
                    {filters.query ? `Results for "${filters.query}"` : 'Trending & Recommended'}
                  </h2>
                </div>
                <span className="text-xs text-slate-500">
                  {searching ? 'Searching…' : `${searchResults.length} titles`}
                </span>
              </div>

              {searchError && (
                <div className="flex items-center gap-2 rounded-lg bg-white/5 p-3 text-xs text-slate-400 border border-white/5">
                  <Info size={16} className="text-neon-400 shrink-0" />
                  <span>{searchError}</span>
                </div>
              )}

              {searching ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 sm:gap-4">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : searchResults.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 sm:gap-4">
                  {searchResults.map((item) => (
                    <MediaCard
                      key={item.imdbID}
                      media={item}
                      tracked={byImdbId.get(item.imdbID)}
                      onAdd={(m) => {
                        if (!user) setShowAuthModal(true);
                        else add(m, 'plan_to_watch');
                      }}
                      onEdit={(t) => setEditingItem(t)}
                      onUpdate={update}
                      onRemove={remove}
                    />
                  ))}
                </div>
              ) : (
                <div className="glass rounded-2xl p-12 text-center space-y-3">
                  <Film size={40} className="mx-auto text-slate-600" />
                  <h3 className="text-base font-semibold text-white">No titles found</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Try searching by another title, selecting 'All' media types, or clearing the release year.
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* VIEW: WATCHLIST */}
        {view === 'watchlist' && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  Your Watchlist
                </h1>
                <p className="text-xs sm:text-sm text-slate-400">
                  {items.length} {items.length === 1 ? 'title' : 'titles'} saved across your custom tracking lists.
                </p>
              </div>
              <WatchlistTabs active={watchlistTab} onChange={setWatchlistTab} items={items} />
            </div>

            {trackerLoading ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 sm:gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : filteredWatchlist.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 sm:gap-4">
                {filteredWatchlist.map((item) => (
                  <MediaCard
                    key={item.id}
                    media={{
                      imdbID: item.imdb_id,
                      title: item.title,
                      year: item.year,
                      type: item.media_type,
                      poster: item.poster,
                    }}
                    tracked={item}
                    onEdit={(t) => setEditingItem(t)}
                    onUpdate={update}
                    onRemove={remove}
                  />
                ))}
              </div>
            ) : (
              <div className="glass rounded-2xl p-12 text-center space-y-4">
                <Film size={48} className="mx-auto text-slate-600" />
                <h3 className="text-lg font-bold text-white">No titles in this list yet</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Browse our discovery feed to add films and television series to your list.
                </p>
                <button onClick={() => setView('discover')} className="btn-primary">
                  Explore Discover
                </button>
              </div>
            )}
          </section>
        )}

        {/* VIEW: INSIGHTS & STATS */}
        {view === 'stats' && (
          <section className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Viewing Insights & Analytics
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Detailed metrics calculated from your viewing history, episode tracking, and ratings.
              </p>
            </div>
            <StatsOverview stats={stats} />
          </section>
        )}
      </main>

      {/* Rating & Progress Modal */}
      {editingItem && (
        <RatingModal
          item={editingItem}
          onSave={update}
          onClose={() => setEditingItem(null)}
        />
      )}

      {/* Authentication Modal */}
      {showAuthModal && (
        <AuthModal
          backendAvailable={backendAvailable}
          error={authError}
          onClose={() => setShowAuthModal(false)}
          onGoogle={signInWithGoogle}
          onEmail={async (email, password, mode) => {
            if (mode === 'signin') return signInWithEmail(email, password);
            return signUpWithEmail(email, password);
          }}
          onGuest={handleGuestEntry}
        />
      )}

      <footer className="mt-auto border-t border-white/5 py-6 text-center text-xs text-slate-500">
        <p>CinePulse &copy; {new Date().getFullYear()} – TV Show & Media Tracker. Built with React 18, TypeScript, Tailwind CSS & Supabase.</p>
      </footer>
    </div>
  );
}
