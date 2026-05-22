export type MediaType = 'movie' | 'series' | 'episode';

export type WatchStatus = 'watching' | 'completed' | 'plan_to_watch' | 'dropped';

export const WATCH_STATUSES: readonly WatchStatus[] = ['watching', 'completed', 'plan_to_watch', 'dropped'] as const;

export const STATUS_LABELS: Record<WatchStatus, string> = {
  watching: 'Watching',
  completed: 'Completed',
  plan_to_watch: 'Plan to Watch',
  dropped: 'Dropped',
};

/** Lightweight record returned by OMDb search. */
export interface MediaSummary {
  imdbID: string;
  title: string;
  year: string;
  type: MediaType;
  poster: string | null;
}

/** Full record returned by OMDb "i=" lookups. */
export interface MediaDetails extends MediaSummary {
  genres: string[];
  runtimeMinutes: number;
  plot: string;
  imdbRating: number | null;
  totalSeasons: number | null;
  /** Average episode count assumed when estimating hours for series. */
  totalEpisodes: number | null;
}

export interface SearchFilters {
  query: string;
  type: MediaType | 'all';
  year: string;
}

export interface SearchResponse {
  results: MediaSummary[];
  total: number;
  /** True when the data came from the bundled demo catalogue. */
  isDemo: boolean;
  error?: string;
}

/** Row shape of public.user_media_list (snake_case mirrors PostgreSQL). */
export interface UserMediaItem {
  id: string;
  user_id: string;
  imdb_id: string;
  title: string;
  year: string;
  media_type: MediaType;
  poster: string | null;
  genres: string[];
  runtime_minutes: number;
  total_episodes: number | null;
  status: WatchStatus;
  current_season: number;
  current_episode: number;
  rating: number | null;
  notes: string;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export type UserMediaPatch = Partial<
  Pick<UserMediaItem, 'status' | 'current_season' | 'current_episode' | 'rating' | 'notes'>
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
  averageRating: number | null;
  genreBreakdown: { genre: string; count: number }[];
  ratingDistribution: number[]; // index 0 => rating 1
  currentStreak: number;
  longestStreak: number;
}
