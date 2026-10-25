export type MediaType = 'movie' | 'series' | 'episode';

export type WatchStatus = 'watching' | 'completed' | 'plan_to_watch' | 'dropped';

export const WATCH_STATUSES: readonly WatchStatus[] = ['watching', 'completed', 'plan_to_watch', 'dropped'] as const;

export const STATUS_LABELS: Record<WatchStatus, string> = {
  watching: 'Currently Watching',
  completed: 'Watched',
  plan_to_watch: 'Watchlist',
  dropped: 'Dropped',
};

/** Summary record returned by multi-database search / discovery */
export interface MediaSummary {
  imdbID: string;
  title: string;
  year: string;
  type: MediaType;
  poster: string | null;
  backdrop?: string | null;
  director?: string;
  creator?: string;
  rating?: number | null;
  genres?: string[];
  overview?: string;
  source?: 'tvmaze' | 'itunes' | 'omdb' | 'tmdb' | 'seed';
}

/** Full record returned by detail lookups */
export interface MediaDetails extends MediaSummary {
  genres: string[];
  runtimeMinutes: number;
  plot: string;
  imdbRating: number | null;
  totalSeasons: number | null;
  totalEpisodes: number | null;
  cast?: string[];
  network?: string;
  tagline?: string;
}

export interface SearchFilters {
  query: string;
  type: MediaType | 'all';
  year: string;
}

export interface SearchResponse {
  results: MediaSummary[];
  total: number;
  isDemo: boolean;
  sourcesUsed?: string[];
  error?: string;
}

/** Featured Hero Backdrop item */
export interface FeaturedBackdrop {
  id: string;
  title: string;
  year: string;
  type: MediaType;
  directorOrCreator: string;
  tagline: string;
  synopsis: string;
  backdropUrl: string;
  posterUrl: string;
  rating: number;
  genres: string[];
  imdbID: string;
}

/** Row shape of public.user_media_list (snake_case mirrors PostgreSQL) */
export interface UserMediaItem {
  id: string;
  user_id: string;
  imdb_id: string;
  title: string;
  year: string;
  media_type: MediaType;
  poster: string | null;
  backdrop?: string | null;
  director?: string;
  genres: string[];
  runtime_minutes: number;
  total_episodes: number | null;
  status: WatchStatus;
  current_season: number;
  current_episode: number;
  rating: number | null; // 1-10
  liked?: boolean; // Letterboxd signature heart
  notes: string;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export type UserMediaPatch = Partial<
  Pick<UserMediaItem, 'status' | 'current_season' | 'current_episode' | 'rating' | 'liked' | 'notes'>
>;

export interface AppUser {
  id: string;
  email: string;
  name: string;
  isGuest: boolean;
}

export interface MediaStats {
  totalTitles: number;
  hoursWatched: number;
  completed: number;
  likedCount: number;
  averageRating: number | null;
  genreBreakdown: { genre: string; count: number }[];
  ratingDistribution: number[]; // index 0 => rating 1
  currentStreak: number;
  longestStreak: number;
}
