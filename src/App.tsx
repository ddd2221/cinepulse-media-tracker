import { useEffect, useState, useTransition } from 'react';
import Navbar, { type View } from './components/Navbar';
import FeaturedBackdropHeader from './components/FeaturedBackdropHeader';
import SearchBar from './components/SearchBar';
import MediaCard, { SkeletonCard } from './components/MediaCard';
import WatchlistTabs, { type TabId } from './components/WatchlistTabs';
import StatsOverview from './components/StatsOverview';
import RatingModal from './components/RatingModal';
import AuthModal from './components/AuthModal';
import { useDebounce } from './hooks/useDebounce';
import { useAuth } from './hooks/useAuth';
import { useMediaTracker } from './hooks/useMediaTracker';
import {
  aggregateMediaSearch,
  CURATED_MASTERPIECES,
  isOmdbConfigured,
  isTmdbConfigured,
} from './services/mediaAggregatorService';
import type { MediaSummary, SearchFilters, UserMediaItem } from './types/media';
import { Film, AlertCircle } from 'lucide-react';

export default function App() {
  const [view, setView] = useState<View>('discover');
  const [watchlistTab, setWatchlistTab] = useState<TabId>('all');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [editingItem, setEditingItem] = useState<UserMediaItem | null>(null);

  // Search & Filter state
  const [filters, setFilters] = useState<SearchFilters>({ query: '', type: 'all', year: '' });
  const debouncedFilters = useDebounce(filters, 350);
  const [searchResults, setSearchResults] = useState<MediaSummary[]>(() => CURATED_MASTERPIECES);
  const [searching, setSearching] = useState(false);
  const [sourcesUsed, setSourcesUsed] = useState<string[]>(['Curated Pool', 'TVMaze', 'Apple iTunes']);
  const [, startTransition] = useTransition();

  // Authentication & Tracker Hooks
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
    toggleLiked,
    toggleWatched,
    toggleWatchlist,
    remove,
    clearError: clearTrackerError,
  } = useMediaTracker(user);

  // Sync navigation view with filter type when clicking Films or Series
  useEffect(() => {
    if (view === 'films') {
      setFilters((prev) => ({ ...prev, type: 'movie' }));
    } else if (view === 'series') {
      setFilters((prev) => ({ ...prev, type: 'series' }));
    } else if (view === 'discover') {
      setFilters((prev) => ({ ...prev, type: 'all' }));
    }
  }, [view]);

  // Multi-Source Search effect
  useEffect(() => {
    const controller = new AbortController();
    setSearching(true);

    aggregateMediaSearch(debouncedFilters, controller.signal)
      .then((res) => {
        startTransition(() => {
          setSearchResults(res.results);
          if (res.sourcesUsed?.length) setSourcesUsed(res.sourcesUsed);
        });
      })
      .catch((err: Error) => {
        if (err.name !== 'AbortError') {
          console.error(err);
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
    if (watchlistTab === 'liked') return item.liked;
    return item.status === watchlistTab;
  });

  const handleGuestEntry = () => {
    continueAsGuest();
    setShowAuthModal(false);
  };

  const handleQuickLog = (media: MediaSummary) => {
    const tracked = byImdbId.get(media.imdbID);
    if (tracked) {
      setEditingItem(tracked);
    } else {
      add(media, 'completed');
    }
  };

  // Curated showcase subsets for Letterboxd editorial sections
  const popularFilms = CURATED_MASTERPIECES.filter((m) => m.type === 'movie').slice(0, 8);
  const acclaimedSeries = CURATED_MASTERPIECES.filter((m) => m.type === 'series').slice(0, 8);

  return (
    <div className="min-h-screen flex flex-col bg-[#14181c] text-[#99aabb]">
      {/* Letterboxd Compact Navbar */}
      <Navbar
        view={view}
        onViewChange={setView}
        user={user}
        onSignInClick={() => setShowAuthModal(true)}
        onSignOut={signOut}
        listCount={items.length}
        onOpenLog={() => {
          if (items.length > 0) setEditingItem(items[0]);
          else setView('discover');
        }}
        searchQuery={filters.query}
        onSearchChange={(q) => setFilters((prev) => ({ ...prev, query: q }))}
      />

      {/* Subtle Data Engine Info Bar */}
      <div className="border-b border-[#232a33] bg-[#14181c] py-1.5 px-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between text-[11px] text-[#667788]">
          <div className="flex items-center gap-2">
            <span className="flex h-1.5 w-1.5 rounded-full bg-[#00e054] animate-pulse" />
            <span className="hidden sm:inline">Multi-Source Aggregator Active:</span>
            <span className="text-[#99aabb]">
              TVMaze (TV) · Apple iTunes (Films) · {isOmdbConfigured ? 'OMDb (Live)' : 'OMDb (Demo)'} · {isTmdbConfigured ? 'TMDB (Live)' : 'TMDB (Seed)'}
            </span>
          </div>

          {!user && (
            <button
              onClick={() => setShowAuthModal(true)}
              className="text-[#00e054] hover:underline font-semibold"
            >
              Sign In / Guest Demo &rarr;
            </button>
          )}
        </div>
      </div>

      {trackerError && (
        <div className="mx-auto mt-3 max-w-7xl px-4 w-full">
          <div className="flex items-center justify-between rounded-sm border border-red-500/30 bg-red-500/10 p-2.5 text-xs text-red-400">
            <div className="flex items-center gap-2">
              <AlertCircle size={15} />
              <span>{trackerError}</span>
            </div>
            <button onClick={clearTrackerError} className="underline hover:text-white">
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="mx-auto max-w-7xl w-full flex-1 px-4 py-6">
        {/* VIEW 1: DISCOVER / FILMS / SERIES */}
        {(view === 'discover' || view === 'films' || view === 'series') && (
          <div className="space-y-8">
            {/* Show Featured Backdrop Header when query is empty and on discover tab */}
            {view === 'discover' && !filters.query && (
              <FeaturedBackdropHeader
                trackedMap={byImdbId}
                onAdd={add}
                onEdit={(item) => setEditingItem(item)}
                onToggleWatched={toggleWatched}
                onToggleLiked={toggleLiked}
                onToggleWatchlist={toggleWatchlist}
                onQuickLog={handleQuickLog}
              />
            )}

            {/* Compact Search Bar & Filters */}
            <SearchBar filters={filters} onChange={setFilters} sourcesCount={sourcesUsed.length} />

            {/* Results or Curated Letterboxd Grids */}
            {filters.query ? (
              /* Search Results Section */
              <div className="space-y-4">
                <div className="lb-section-header">
                  <span>
                    SEARCH RESULTS FOR &ldquo;{filters.query}&rdquo;
                  </span>
                  <span className="text-[10px] text-[#667788]">
                    {searching ? 'Querying 4 databases…' : `${searchResults.length} titles matched`}
                  </span>
                </div>

                {searching ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-3 sm:gap-4">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <SkeletonCard key={i} />
                    ))}
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-3 sm:gap-4">
                    {searchResults.map((item) => (
                      <MediaCard
                        key={item.imdbID}
                        media={item}
                        tracked={byImdbId.get(item.imdbID)}
                        onAdd={(m, s, l) => {
                          if (!user) setShowAuthModal(true);
                          else add(m, s, l);
                        }}
                        onEdit={(t) => setEditingItem(t)}
                        onUpdate={update}
                        onRemove={remove}
                        onToggleWatched={toggleWatched}
                        onToggleLiked={toggleLiked}
                        onToggleWatchlist={toggleWatchlist}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="lb-card p-12 text-center space-y-3">
                    <Film size={36} className="mx-auto text-[#667788]" />
                    <h3 className="font-serif text-base font-bold text-white">No titles found</h3>
                    <p className="text-xs text-[#99aabb] max-w-sm mx-auto">
                      Try searching with another keyword or selecting &lsquo;All Media&rsquo;.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* Default Letterboxd Editorial Showcase Feed */
              <div className="space-y-10">
                {/* Section 1: Popular on CinePulse This Week */}
                <section className="space-y-4">
                  <div className="lb-section-header">
                    <span>POPULAR ON CINEPULSE THIS WEEK</span>
                    <span className="text-[10px] text-[#00e054]">TOP RATED</span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-3 sm:gap-4">
                    {searchResults.slice(0, 8).map((item) => (
                      <MediaCard
                        key={item.imdbID}
                        media={item}
                        tracked={byImdbId.get(item.imdbID)}
                        onAdd={(m, s, l) => {
                          if (!user) setShowAuthModal(true);
                          else add(m, s, l);
                        }}
                        onEdit={(t) => setEditingItem(t)}
                        onUpdate={update}
                        onRemove={remove}
                        onToggleWatched={toggleWatched}
                        onToggleLiked={toggleLiked}
                        onToggleWatchlist={toggleWatchlist}
                      />
                    ))}
                  </div>
                </section>

                {/* Section 2: Acclaimed Masterpiece Films */}
                {view !== 'series' && (
                  <section className="space-y-4">
                    <div className="lb-section-header">
                      <span>TIMELESS FEATURE FILMS</span>
                      <span className="text-[10px] text-[#667788]">DIRECTOR SPOTLIGHT</span>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-3 sm:gap-4">
                      {popularFilms.map((item) => (
                        <MediaCard
                          key={item.imdbID}
                          media={item}
                          tracked={byImdbId.get(item.imdbID)}
                          onAdd={(m, s, l) => {
                            if (!user) setShowAuthModal(true);
                            else add(m, s, l);
                          }}
                          onEdit={(t) => setEditingItem(t)}
                          onUpdate={update}
                          onRemove={remove}
                          onToggleWatched={toggleWatched}
                          onToggleLiked={toggleLiked}
                          onToggleWatchlist={toggleWatchlist}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Section 3: Acclaimed Television Series */}
                {view !== 'films' && (
                  <section className="space-y-4">
                    <div className="lb-section-header">
                      <span>ACCLAIMED PRESTIGE SERIES</span>
                      <span className="text-[10px] text-[#667788]">TELEVISION EXCELLENCE</span>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-3 sm:gap-4">
                      {acclaimedSeries.map((item) => (
                        <MediaCard
                          key={item.imdbID}
                          media={item}
                          tracked={byImdbId.get(item.imdbID)}
                          onAdd={(m, s, l) => {
                            if (!user) setShowAuthModal(true);
                            else add(m, s, l);
                          }}
                          onEdit={(t) => setEditingItem(t)}
                          onUpdate={update}
                          onRemove={remove}
                          onToggleWatched={toggleWatched}
                          onToggleLiked={toggleLiked}
                          onToggleWatchlist={toggleWatchlist}
                        />
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: WATCHLIST & DIARY */}
        {view === 'watchlist' && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#2c3440] pb-4">
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-white">
                  Your Cinema Diary & Watchlist
                </h1>
                <p className="text-xs text-[#99aabb]">
                  {items.length} titles logged · {items.filter((i) => i.liked).length} favorites
                </p>
              </div>
              <WatchlistTabs active={watchlistTab} onChange={setWatchlistTab} items={items} />
            </div>

            {trackerLoading ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-3 sm:gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : filteredWatchlist.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-3 sm:gap-4">
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
                    onToggleWatched={toggleWatched}
                    onToggleLiked={toggleLiked}
                    onToggleWatchlist={toggleWatchlist}
                  />
                ))}
              </div>
            ) : (
              <div className="lb-card p-12 text-center space-y-3">
                <Film size={42} className="mx-auto text-[#667788]" />
                <h3 className="font-serif text-base font-bold text-white">No titles in this category</h3>
                <p className="text-xs text-[#99aabb] max-w-sm mx-auto">
                  Browse our live multi-source database to add films and series to your diary.
                </p>
                <button onClick={() => setView('discover')} className="lb-btn-green mt-2">
                  Browse Discover
                </button>
              </div>
            )}
          </section>
        )}

        {/* VIEW 3: DIARY & STATS */}
        {view === 'stats' && (
          <section className="space-y-6">
            <div className="border-b border-[#2c3440] pb-4">
              <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-white">
                Viewing Diary & Analytics
              </h1>
              <p className="text-xs text-[#99aabb]">
                Detailed viewing statistics, time investment, rating histograms, and genre tastes.
              </p>
            </div>
            <StatsOverview stats={stats} />
          </section>
        )}
      </main>

      {/* Letterboxd Rating & Log Modal */}
      {editingItem && (
        <RatingModal
          item={editingItem}
          onSave={update}
          onRemove={remove}
          onClose={() => setEditingItem(null)}
        />
      )}

      {/* Supabase & Guest Auth Modal */}
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

      {/* Letterboxd Minimal Footer */}
      <footer className="mt-auto border-t border-[#2c3440] bg-[#14181c] py-6 text-center text-xs text-[#667788]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 font-bold tracking-widest text-[#99aabb]">
            <span className="h-2 w-2 rounded-full bg-[#ff8000]" />
            <span className="h-2 w-2 rounded-full bg-[#00e054]" />
            <span className="h-2 w-2 rounded-full bg-[#40bcf4]" />
            <span className="text-white ml-1">CINEPULSE</span>
            <span>· TV SHOW & MEDIA TRACKER</span>
          </div>
          <p>
            Film & series data dynamically aggregated from TVMaze, Apple iTunes, OMDb & TMDB.
          </p>
        </div>
      </footer>
    </div>
  );
}
