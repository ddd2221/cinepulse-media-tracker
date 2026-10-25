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
  fetchBrowseCatalog,
  CURATED_MASTERPIECES,
  isOmdbConfigured,
  isTmdbConfigured,
} from './services/mediaAggregatorService';
import type { MediaSummary, SearchFilters, UserMediaItem } from './types/media';
import { Film, AlertCircle, Loader2 } from 'lucide-react';

export default function App() {
  const [view, setView] = useState<View>('explore');
  const [watchlistTab, setWatchlistTab] = useState<TabId>('all');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [editingItem, setEditingItem] = useState<UserMediaItem | null>(null);

  // Search & Filter state
  const [filters, setFilters] = useState<SearchFilters>({ query: '', type: 'all', year: '' });
  const debouncedFilters = useDebounce(filters, 350);
  const [searchResults, setSearchResults] = useState<MediaSummary[]>(() => CURATED_MASTERPIECES);
  const [searching, setSearching] = useState(false);
  const [sourcesUsed, setSourcesUsed] = useState<string[]>(['Curated Vault', 'YTS Cinema', 'TVMaze', 'IMDb', 'Apple iTunes']);
  const [browsePage, setBrowsePage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
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

  // Sync navigation view with filter type when clicking Movies or TV Shows
  useEffect(() => {
    setBrowsePage(1);
    if (view === 'movies') {
      setFilters((prev) => ({ ...prev, type: 'movie' }));
    } else if (view === 'tv') {
      setFilters((prev) => ({ ...prev, type: 'series' }));
    } else if (view === 'explore') {
      setFilters((prev) => ({ ...prev, type: 'all' }));
    }
  }, [view]);

  // Multi-Source Search & Live Catalog effect
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

  // Pagination for + Load More From Archive
  const handleLoadMore = async () => {
    const nextPage = browsePage + 1;
    setLoadingMore(true);
    try {
      const more = await fetchBrowseCatalog(filters.type, nextPage);
      startTransition(() => {
        setSearchResults((prev) => {
          const seen = new Set(prev.map((i) => i.imdbID));
          const added = more.filter((i) => !seen.has(i.imdbID));
          return [...prev, ...added];
        });
        setBrowsePage(nextPage);
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  };

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

  // Curated subsets for highlights
  const movieResults = searchResults.filter((m) => m.type === 'movie');
  const seriesResults = searchResults.filter((m) => m.type === 'series');

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0c] text-zinc-300">
      {/* CinePulse Editorial Glassmorphic Navbar */}
      <Navbar
        view={view}
        onViewChange={setView}
        user={user}
        onSignInClick={() => setShowAuthModal(true)}
        onSignOut={signOut}
        listCount={items.length}
        onOpenLog={() => {
          if (items.length > 0) setEditingItem(items[0]);
          else setView('explore');
        }}
        searchQuery={filters.query}
        onSearchChange={(q) => setFilters((prev) => ({ ...prev, query: q }))}
      />

      {/* Subtle Data Engine Info Bar */}
      <div className="border-b border-white/[0.06] bg-[#0a0a0c] py-1.5 px-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between font-mono text-[11px] text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="flex h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="hidden sm:inline">Active Aggregator Engine:</span>
            <span className="text-zinc-400">
              IMDb Open Search · YTS Cinema · Apple iTunes · TVMaze · {isOmdbConfigured ? 'OMDb' : 'OMDb Demo'} · {isTmdbConfigured ? 'TMDB' : 'TMDB Seed'}
            </span>
          </div>

          {!user && (
            <button
              onClick={() => setShowAuthModal(true)}
              className="text-amber-400 hover:text-amber-300 hover:underline font-semibold"
            >
              Sign In / Guest Demo &rarr;
            </button>
          )}
        </div>
      </div>

      {trackerError && (
        <div className="mx-auto mt-3 max-w-7xl px-4 w-full">
          <div className="flex items-center justify-between rounded-md border border-rose-500/30 bg-rose-500/10 p-2.5 text-xs text-rose-400">
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
      <main className="mx-auto max-w-7xl w-full flex-1 px-4 py-7">
        {/* VIEW 1: EXPLORE / MOVIES / TV SHOWS */}
        {(view === 'explore' || view === 'movies' || view === 'tv') && (
          <div className="space-y-9">
            {/* Show Featured Backdrop Header when query is empty on explore tab */}
            {view === 'explore' && !filters.query && (
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

            {/* Search Bar & Categorization */}
            <SearchBar filters={filters} onChange={setFilters} sourcesCount={sourcesUsed.length} />

            {/* Live Search Results OR Categorized Editorial Catalog */}
            {filters.query ? (
              <div className="space-y-4">
                <div className="section-divider">
                  <span>SEARCH RESULTS FOR &ldquo;{filters.query}&rdquo;</span>
                  <span className="text-[10px] text-amber-500 font-mono">
                    {searching ? 'Querying databases…' : `${searchResults.length} TITLES FOUND`}
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
                  <div className="obsidian-surface p-12 text-center space-y-3">
                    <Film size={36} className="mx-auto text-zinc-600" />
                    <h3 className="font-serif text-base font-bold text-white">No Archive Matches</h3>
                    <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                      Try searching with another title, director name, or clear the release year filter.
                    </p>
                  </div>
                )}
              </div>
            ) : view === 'movies' ? (
              /* Dedicated Movies Tab Catalog (60+ Live Movies) */
              <div className="space-y-6">
                <div className="section-divider">
                  <span>FEATURE MOVIES CATALOGUE</span>
                  <span className="text-[10px] text-amber-500 font-mono">{movieResults.length} TITLES LOADED</span>
                </div>

                {searching ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-3 sm:gap-4">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <SkeletonCard key={i} />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-3 sm:gap-4">
                    {movieResults.map((item) => (
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
                )}

                {/* + Load More From Archive Button */}
                <div className="flex justify-center pt-8 pb-4">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="btn-glass px-6 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-amber-400 hover:border-amber-500/50 hover:bg-amber-500/10 transition"
                  >
                    {loadingMore ? (
                      <span className="flex items-center gap-2">
                        <Loader2 size={13} className="animate-spin" />
                        <span>Accessing Archive Databases…</span>
                      </span>
                    ) : (
                      <span>+ Load More From Archive</span>
                    )}
                  </button>
                </div>
              </div>
            ) : view === 'tv' ? (
              /* Dedicated TV Series Tab Catalog (60+ Live Series) */
              <div className="space-y-6">
                <div className="section-divider">
                  <span>PRESTIGE TELEVISION CATALOGUE</span>
                  <span className="text-[10px] text-amber-500 font-mono">{seriesResults.length} TITLES LOADED</span>
                </div>

                {searching ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-3 sm:gap-4">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <SkeletonCard key={i} />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-3 sm:gap-4">
                    {seriesResults.map((item) => (
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
                )}

                {/* + Load More From Archive Button */}
                <div className="flex justify-center pt-8 pb-4">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="btn-glass px-6 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-amber-400 hover:border-amber-500/50 hover:bg-amber-500/10 transition"
                  >
                    {loadingMore ? (
                      <span className="flex items-center gap-2">
                        <Loader2 size={13} className="animate-spin" />
                        <span>Accessing Archive Databases…</span>
                      </span>
                    ) : (
                      <span>+ Load More From Archive</span>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* Default Explore Showcase Feed (Curated Highlights + Full Live Archive) */
              <div className="space-y-11">
                {/* Section 1: Popular Picks */}
                <section className="space-y-4">
                  <div className="section-divider">
                    <span>POPULAR SELECTIONS THIS WEEK</span>
                    <span className="text-[10px] text-amber-500 font-mono">CRITICS&rsquo; PICKS</span>
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

                {/* Section 2: Timeless Feature Films */}
                <section className="space-y-4">
                  <div className="section-divider">
                    <span>FEATURE FILMS SPOTLIGHT</span>
                    <span className="text-[10px] text-zinc-500 font-mono">THEATRICAL MASTERPIECES</span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-3 sm:gap-4">
                    {movieResults.slice(0, 8).map((item) => (
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

                {/* Section 3: Prestige Television Series */}
                <section className="space-y-4">
                  <div className="section-divider">
                    <span>PRESTIGE TELEVISION SERIES</span>
                    <span className="text-[10px] text-zinc-500 font-mono">EPISODIC EXCELLENCE</span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-3 sm:gap-4">
                    {seriesResults.slice(0, 8).map((item) => (
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

                {/* Section 4: Full Multi-Database Archive Feed */}
                <section className="space-y-4">
                  <div className="section-divider">
                    <span>LIVE MULTI-DATABASE ARCHIVE</span>
                    <span className="text-[10px] text-amber-500 font-mono">{searchResults.length} TITLES IN FEED</span>
                  </div>
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

                  {/* + Load More From Archive Button */}
                  <div className="flex justify-center pt-8 pb-4">
                    <button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="btn-glass px-6 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-amber-400 hover:border-amber-500/50 hover:bg-amber-500/10 transition"
                    >
                      {loadingMore ? (
                        <span className="flex items-center gap-2">
                          <Loader2 size={13} className="animate-spin" />
                          <span>Accessing Archive Databases…</span>
                        </span>
                      ) : (
                        <span>+ Load More From Archive</span>
                      )}
                    </button>
                  </div>
                </section>
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: MY VAULT (WATCHLIST & PROGRESS) */}
        {view === 'vault' && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/[0.08] pb-4">
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                  Cinema Vault & Personal Archive
                </h1>
                <p className="font-mono text-xs text-zinc-400 mt-1">
                  {items.length} titles recorded • {items.filter((i) => i.liked).length} personal favorites
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
              <div className="obsidian-surface p-12 text-center space-y-3">
                <Film size={40} className="mx-auto text-zinc-600" />
                <h3 className="font-serif text-base font-bold text-white">Vault Category Empty</h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  Browse our multi-source archive to add films and episodic series to your vault.
                </p>
                <button onClick={() => setView('explore')} className="btn-amber mt-2">
                  Browse Archive
                </button>
              </div>
            )}
          </section>
        )}

        {/* VIEW 3: ANALYTICS & INSIGHTS */}
        {view === 'analytics' && (
          <section className="space-y-6">
            <div className="border-b border-white/[0.08] pb-4">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                Viewing Analytics & Archive Metrics
              </h1>
              <p className="font-mono text-xs text-zinc-400 mt-1">
                Quantitative tracking of watchtime, score distribution, completion streaks, and genre affinities.
              </p>
            </div>
            <StatsOverview stats={stats} />
          </section>
        )}
      </main>

      {/* Rating & Log Modal */}
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

      {/* CinePulse Minimalist Editorial Footer */}
      <footer className="mt-auto border-t border-white/[0.08] bg-[#0a0a0c] py-6 text-xs text-zinc-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded border border-amber-500/30 bg-[#121318]">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            </div>
            <span className="font-sans font-bold tracking-[0.2em] text-zinc-200">
              CINE<span className="text-amber-500">PULSE</span>
            </span>
            <span className="text-zinc-600">/</span>
            <span>CINEMA VAULT & MEDIA TRACKER</span>
          </div>
          <p className="text-zinc-500">
            Powered by Multi-Source Aggregator: IMDb Open Search · YTS · Apple iTunes · TVMaze · OMDb · TMDB
          </p>
        </div>
      </footer>
    </div>
  );
}
