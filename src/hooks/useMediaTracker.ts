import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { getAggregatedDetails } from '../services/mediaAggregatorService';
import type { AppUser, MediaStats, MediaSummary, UserMediaItem, UserMediaPatch } from '../types/media';

const TABLE = 'user_media_list';
const storageKey = (userId: string) => `cinepulse:list:${userId}`;

const VERIFIED_SERIES_POSTERS: Record<string, string> = {
  tt7660850: 'https://static.tvmaze.com/uploads/images/original_untouched/453/1134275.jpg', // Succession
  tt14452776: 'https://static.tvmaze.com/uploads/images/original_untouched/629/1574642.jpg', // The Bear
  tt7366338: 'https://static.tvmaze.com/uploads/images/original_untouched/193/482599.jpg', // Chernobyl
  tt11280740: 'https://static.tvmaze.com/uploads/images/original_untouched/548/1371406.jpg', // Severance
  tt4574334: 'https://static.tvmaze.com/uploads/images/original_untouched/595/1489169.jpg', // Stranger Things
  tt2085059: 'https://static.tvmaze.com/uploads/images/original_untouched/564/1411764.jpg', // Black Mirror
  tt0306414: 'https://static.tvmaze.com/uploads/images/original_untouched/504/1260189.jpg', // The Wire
};

const sanitizeItems = (items: UserMediaItem[]): UserMediaItem[] => {
  return items.map((item) => {
    if (VERIFIED_SERIES_POSTERS[item.imdb_id] && item.poster !== VERIFIED_SERIES_POSTERS[item.imdb_id]) {
      return { ...item, poster: VERIFIED_SERIES_POSTERS[item.imdb_id] };
    }
    return item;
  });
};

const readLocal = (userId: string): UserMediaItem[] => {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as UserMediaItem[];
    const sanitized = sanitizeItems(parsed);
    if (JSON.stringify(parsed) !== JSON.stringify(sanitized)) {
      localStorage.setItem(storageKey(userId), JSON.stringify(sanitized));
    }
    return sanitized;
  } catch {
    return [];
  }
};

const demoSeed = (userId: string): UserMediaItem[] => {
  const now = Date.now();
  const mk = (
    i: number,
    p: Partial<UserMediaItem> & Pick<UserMediaItem, 'imdb_id' | 'title' | 'year' | 'media_type' | 'genres' | 'runtime_minutes' | 'status' | 'poster'>,
    daysAgo: number,
  ): UserMediaItem => ({
    id: `seed-${i}`,
    user_id: userId,
    total_episodes: null,
    current_season: 1,
    current_episode: 0,
    rating: null,
    liked: false,
    notes: '',
    created_at: new Date(now - daysAgo * 864e5).toISOString(),
    updated_at: new Date(now - daysAgo * 864e5).toISOString(),
    completed_at: p.status === 'completed' ? new Date(now - daysAgo * 864e5).toISOString() : null,
    ...p,
  });

  return [
    mk(1, {
      imdb_id: 'tt0903747',
      title: 'Breaking Bad',
      year: '2008–2013',
      media_type: 'series',
      poster: 'https://static.tvmaze.com/uploads/images/original_untouched/501/1253519.jpg',
      genres: ['Crime', 'Drama', 'Thriller'],
      runtime_minutes: 47,
      total_episodes: 62,
      status: 'completed',
      current_season: 5,
      current_episode: 16,
      rating: 10,
      liked: true,
      notes: 'Peak television storytelling. Unmatched character progression.',
    }, 0),
    mk(2, {
      imdb_id: 'tt1375666',
      title: 'Inception',
      year: '2010',
      media_type: 'movie',
      poster: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg',
      genres: ['Action', 'Adventure', 'Sci-Fi'],
      runtime_minutes: 148,
      status: 'completed',
      rating: 9,
      liked: true,
      notes: 'Brilliant sound design and cerebral pacing.',
    }, 1),
    mk(3, {
      imdb_id: 'tt0816692',
      title: 'Interstellar',
      year: '2014',
      media_type: 'movie',
      poster: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
      genres: ['Adventure', 'Drama', 'Sci-Fi'],
      runtime_minutes: 169,
      status: 'completed',
      rating: 10,
      liked: true,
      notes: 'Hans Zimmer score and emotional weight makes this timeless.',
    }, 2),
    mk(4, {
      imdb_id: 'tt7366338',
      title: 'Chernobyl',
      year: '2019',
      media_type: 'series',
      poster: 'https://static.tvmaze.com/uploads/images/original_untouched/193/482599.jpg',
      genres: ['Drama', 'History', 'Thriller'],
      runtime_minutes: 65,
      total_episodes: 5,
      status: 'completed',
      current_season: 1,
      current_episode: 5,
      rating: 10,
      liked: true,
      notes: 'Terrifying, meticulous historical drama.',
    }, 4),
    mk(5, {
      imdb_id: 'tt4574334',
      title: 'Stranger Things',
      year: '2016–2025',
      media_type: 'series',
      poster: 'https://static.tvmaze.com/uploads/images/original_untouched/499/1249767.jpg',
      genres: ['Drama', 'Fantasy', 'Horror'],
      runtime_minutes: 51,
      total_episodes: 42,
      status: 'watching',
      current_season: 2,
      current_episode: 5,
      rating: 8,
      liked: false,
    }, 6),
    mk(6, {
      imdb_id: 'tt15239678',
      title: 'Dune: Part Two',
      year: '2024',
      media_type: 'movie',
      poster: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg',
      genres: ['Action', 'Adventure', 'Sci-Fi'],
      runtime_minutes: 166,
      status: 'plan_to_watch',
      liked: true,
    }, 7),
    mk(7, {
      imdb_id: 'tt2085059',
      title: 'Black Mirror',
      year: '2011–',
      media_type: 'series',
      poster: 'https://static.tvmaze.com/uploads/images/original_untouched/464/1161208.jpg',
      genres: ['Drama', 'Sci-Fi', 'Thriller'],
      runtime_minutes: 60,
      total_episodes: 33,
      status: 'dropped',
      current_season: 1,
      current_episode: 3,
      rating: 5,
      liked: false,
    }, 12),
  ];
};

const dayKey = (iso: string) => iso.slice(0, 10);

/** Pure function for statistics calculation */
export function computeStats(items: UserMediaItem[]): MediaStats {
  let minutes = 0;
  const genres = new Map<string, number>();
  const ratings = Array<number>(10).fill(0);
  const ratingValues: number[] = [];
  const days = new Set<string>();
  let likedCount = 0;

  for (const it of items) {
    if (it.liked) likedCount += 1;

    if (it.status === 'completed') {
      minutes += it.media_type === 'series' && it.total_episodes ? it.total_episodes * it.runtime_minutes : it.runtime_minutes;
      if (it.completed_at) days.add(dayKey(it.completed_at));
    } else if (it.media_type !== 'movie' && it.status !== 'plan_to_watch') {
      const watched = it.total_episodes ? Math.min(it.total_episodes, Math.max(0, (it.current_season - 1) * 10 + it.current_episode)) : it.current_episode;
      minutes += watched * it.runtime_minutes;
    }

    for (const g of it.genres) genres.set(g, (genres.get(g) ?? 0) + 1);

    if (it.rating) {
      ratings[it.rating - 1] += 1;
      ratingValues.push(it.rating);
    }
  }

  // Streaks calculation
  const sorted = [...days].sort();
  let longest = 0, run = 0, prev: number | null = null;
  for (const day of sorted) {
    const t = Date.parse(day);
    run = prev !== null && t - prev === 864e5 ? run + 1 : 1;
    longest = Math.max(longest, run);
    prev = t;
  }
  let current = 0;
  const cursor = new Date();
  if (!days.has(dayKey(cursor.toISOString()))) cursor.setUTCDate(cursor.getUTCDate() - 1);
  while (days.has(dayKey(cursor.toISOString()))) {
    current += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  return {
    totalTitles: items.length,
    hoursWatched: Math.round(minutes / 6) / 10,
    completed: items.filter((i) => i.status === 'completed').length,
    likedCount,
    averageRating: ratingValues.length ? Math.round((ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length) * 10) / 10 : null,
    genreBreakdown: [...genres].map(([genre, count]) => ({ genre, count })).sort((a, b) => b.count - a.count),
    ratingDistribution: ratings,
    currentStreak: current,
    longestStreak: longest,
  };
}

export function useMediaTracker(user: AppUser | null) {
  const [items, setItems] = useState<UserMediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remote = Boolean(user && !user.isGuest && supabase);

  // Load items on user change
  useEffect(() => {
    if (!user) {
      setItems([]);
      return;
    }
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      if (remote && supabase) {
        const { data, error: e } = await supabase.from(TABLE).select('*').order('updated_at', { ascending: false });
        if (cancelled) return;
        if (e) setError(e.message);
        else setItems((data ?? []) as UserMediaItem[]);
      } else {
        const stored = localStorage.getItem(storageKey(user.id));
        setItems(stored === null ? demoSeed(user.id) : readLocal(user.id));
      }
      setLoading(false);
    };
    void load();
    return () => { cancelled = true; };
  }, [user, remote]);

  // Persist locally for guests/offline
  useEffect(() => {
    if (user && !remote && !loading) localStorage.setItem(storageKey(user.id), JSON.stringify(items));
  }, [items, user, remote, loading]);

  const add = useCallback(async (media: MediaSummary, status: UserMediaItem['status'] = 'plan_to_watch', liked = false) => {
    if (!user) return;
    const details = await getAggregatedDetails(media);
    const now = new Date().toISOString();
    const draft = {
      user_id: user.id,
      imdb_id: media.imdbID,
      title: media.title,
      year: media.year,
      media_type: media.type,
      poster: media.poster || details.poster,
      backdrop: media.backdrop,
      director: media.director || details.director,
      genres: details.genres.length ? details.genres : ['Drama'],
      runtime_minutes: details.runtimeMinutes,
      total_episodes: details.totalEpisodes,
      status,
      current_season: 1,
      current_episode: 0,
      rating: null,
      liked,
      notes: '',
      completed_at: status === 'completed' ? now : null,
    };

    if (remote && supabase) {
      const { data, error: e } = await supabase.from(TABLE).upsert(draft, { onConflict: 'user_id,imdb_id' }).select().single();
      if (e) return setError(e.message);
      setItems((prev) => [data as UserMediaItem, ...prev.filter((i) => i.imdb_id !== media.imdbID)]);
    } else {
      const row: UserMediaItem = { ...draft, id: crypto.randomUUID(), created_at: now, updated_at: now };
      setItems((prev) => (prev.some((i) => i.imdb_id === media.imdbID) ? prev : [row, ...prev]));
    }
  }, [user, remote]);

  const update = useCallback(async (id: string, patch: UserMediaPatch) => {
    const now = new Date().toISOString();
    const full: Partial<UserMediaItem> = { ...patch, updated_at: now };
    if (patch.status) full.completed_at = patch.status === 'completed' ? now : null;
    const snapshot = items;
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...full } : i))); // optimistic update

    if (remote && supabase) {
      const { error: e } = await supabase.from(TABLE).update(full).eq('id', id);
      if (e) {
        setItems(snapshot);
        setError(e.message);
      }
    }
  }, [items, remote]);

  const toggleLiked = useCallback(async (item: UserMediaItem) => {
    await update(item.id, { liked: !item.liked });
  }, [update]);

  const toggleWatched = useCallback(async (item: UserMediaItem) => {
    const nextStatus = item.status === 'completed' ? 'plan_to_watch' : 'completed';
    await update(item.id, { status: nextStatus });
  }, [update]);

  const toggleWatchlist = useCallback(async (item: UserMediaItem) => {
    const nextStatus = item.status === 'plan_to_watch' ? 'watching' : 'plan_to_watch';
    await update(item.id, { status: nextStatus });
  }, [update]);

  const remove = useCallback(async (id: string) => {
    const snapshot = items;
    setItems((prev) => prev.filter((i) => i.id !== id));
    if (remote && supabase) {
      const { error: e } = await supabase.from(TABLE).delete().eq('id', id);
      if (e) {
        setItems(snapshot);
        setError(e.message);
      }
    }
  }, [items, remote]);

  const stats = useMemo(() => computeStats(items), [items]);
  const byImdbId = useMemo(() => new Map(items.map((i) => [i.imdb_id, i])), [items]);

  return {
    items,
    stats,
    byImdbId,
    loading,
    error,
    remote,
    add,
    update,
    toggleLiked,
    toggleWatched,
    toggleWatchlist,
    remove,
    clearError: () => setError(null),
  };
}
