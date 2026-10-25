import type { FeaturedBackdrop, MediaDetails, MediaSummary, MediaType, SearchFilters, SearchResponse } from '../types/media';

/* ------------------------------------------------------------------ */
/* Environment & API Key detection                                   */
/* ------------------------------------------------------------------ */
const OMDB_URL = 'https://www.omdbapi.com/';
const OMDB_KEY = (import.meta.env.VITE_OMDB_API_KEY as string | undefined)?.trim();
export const isOmdbConfigured = Boolean(OMDB_KEY) && OMDB_KEY !== 'your-omdb-key';

const TMDB_KEY = (import.meta.env.VITE_TMDB_API_KEY as string | undefined)?.trim();
export const isTmdbConfigured = Boolean(TMDB_KEY) && TMDB_KEY !== 'your-tmdb-key';

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */
const stripHtml = (html?: string): string =>
  html ? html.replace(/<[^>]*>?/gm, '').trim() : '';

const normalizeTitle = (t: string): string =>
  t.toLowerCase().replace(/[^a-z0-9]/g, '');

const upgradeItunesArtwork = (url?: string): string | null => {
  if (!url) return null;
  // Replace 100x100bb with 600x900bb for high-resolution theatrical poster
  return url.replace(/\/\d+x\d+bb\./, '/600x900bb.').replace('100x100bb', '600x900bb');
};

/* ------------------------------------------------------------------ */
/* SOURCE 4: Curated Verified Masterpieces & Hero Backdrops            */
/* ------------------------------------------------------------------ */
export const FEATURED_HERO_BACKDROPS: FeaturedBackdrop[] = [
  {
    id: 'hero-1',
    imdbID: 'tt1375666',
    title: 'Inception',
    year: '2010',
    type: 'movie',
    directorOrCreator: 'Christopher Nolan',
    tagline: 'Your mind is the scene of the crime.',
    synopsis: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O., but his tragic past may doom the project and his team to disaster.',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg',
    posterUrl: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg',
    rating: 8.8,
    genres: ['Action', 'Sci-Fi', 'Adventure'],
  },
  {
    id: 'hero-2',
    imdbID: 'tt1856010',
    title: 'Blade Runner 2049',
    year: '2017',
    type: 'movie',
    directorOrCreator: 'Denis Villeneuve',
    tagline: 'The key to the future is finally unearthed.',
    synopsis: 'Thirty years after the events of the first film, a new Blade Runner, LAPD Officer K, unearths a long-buried secret that has the potential to plunge what’s left of society into chaos.',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/2u7zbn8EudG6kLlBzUYqP8RyFU4.jpg',
    posterUrl: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/gKkl37BQuKTanygYQG1pyYgLVgf.jpg',
    rating: 8.0,
    genres: ['Sci-Fi', 'Mystery', 'Drama'],
  },
  {
    id: 'hero-3',
    imdbID: 'tt7660850',
    title: 'Succession',
    year: '2018–2023',
    type: 'series',
    directorOrCreator: 'Jesse Armstrong',
    tagline: 'The Roy family is known for controlling the biggest media and entertainment company in the world.',
    synopsis: 'The Roy family is known for controlling Waystar RoyCo. However, their world changes when their aging father steps down from the company, triggering a vicious battle for control.',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/s3TBrRGB1iav7gFOCNx3H31MoES.jpg',
    posterUrl: 'https://static.tvmaze.com/uploads/images/original_untouched/443/1109404.jpg',
    rating: 8.9,
    genres: ['Drama'],
  },
  {
    id: 'hero-4',
    imdbID: 'tt0816692',
    title: 'Interstellar',
    year: '2014',
    type: 'movie',
    directorOrCreator: 'Christopher Nolan',
    tagline: 'Mankind was born on Earth. It was never meant to die here.',
    synopsis: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
    posterUrl: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    rating: 8.7,
    genres: ['Adventure', 'Drama', 'Sci-Fi'],
  },
  {
    id: 'hero-5',
    imdbID: 'tt0903747',
    title: 'Breaking Bad',
    year: '2008–2013',
    type: 'series',
    directorOrCreator: 'Vince Gilligan',
    tagline: 'Change the equation.',
    synopsis: 'A chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine with a former student in order to secure his family’s financial future.',
    backdropUrl: 'https://static.tvmaze.com/uploads/images/original_untouched/219/547904.jpg',
    posterUrl: 'https://static.tvmaze.com/uploads/images/original_untouched/501/1253519.jpg',
    rating: 9.5,
    genres: ['Crime', 'Drama', 'Thriller'],
  },
  {
    id: 'hero-6',
    imdbID: 'tt0468569',
    title: 'The Dark Knight',
    year: '2008',
    type: 'movie',
    directorOrCreator: 'Christopher Nolan',
    tagline: 'Why so serious?',
    synopsis: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg',
    posterUrl: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    rating: 9.0,
    genres: ['Action', 'Crime', 'Drama'],
  },
  {
    id: 'hero-7',
    imdbID: 'tt6751668',
    title: 'Parasite',
    year: '2019',
    type: 'movie',
    directorOrCreator: 'Bong Joon-ho',
    tagline: 'Act like you own the place.',
    synopsis: 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/hiKmpZMGZsrkA3cdce8a7Dpos1j.jpg',
    posterUrl: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    rating: 8.5,
    genres: ['Drama', 'Thriller', 'Comedy'],
  },
];

export const CURATED_MASTERPIECES: MediaSummary[] = [
  {
    imdbID: 'tt15239678',
    title: 'Dune: Part Two',
    year: '2024',
    type: 'movie',
    poster: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg',
    director: 'Denis Villeneuve',
    rating: 8.6,
    genres: ['Action', 'Adventure', 'Sci-Fi'],
    overview: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
    source: 'seed',
  },
  {
    imdbID: 'tt15398776',
    title: 'Oppenheimer',
    year: '2023',
    type: 'movie',
    poster: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    director: 'Christopher Nolan',
    rating: 8.9,
    genres: ['Biography', 'Drama', 'History'],
    overview: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.',
    source: 'seed',
  },
  {
    imdbID: 'tt11280740',
    title: 'Severance',
    year: '2022–',
    type: 'series',
    poster: 'https://static.tvmaze.com/uploads/images/original_untouched/423/1058422.jpg',
    creator: 'Dan Erickson',
    rating: 8.7,
    genres: ['Drama', 'Mystery', 'Sci-Fi'],
    overview: 'Mark leads a team of office workers whose memories have been surgically divided between their work and personal lives.',
    source: 'seed',
  },
  {
    imdbID: 'tt7660850',
    title: 'Succession',
    year: '2018–2023',
    type: 'series',
    poster: 'https://static.tvmaze.com/uploads/images/original_untouched/443/1109404.jpg',
    creator: 'Jesse Armstrong',
    rating: 8.9,
    genres: ['Drama'],
    overview: 'The Roy family is known for controlling Waystar RoyCo, one of the biggest media and entertainment conglomerates in the world.',
    source: 'seed',
  },
  {
    imdbID: 'tt14452776',
    title: 'The Bear',
    year: '2022–',
    type: 'series',
    poster: 'https://static.tvmaze.com/uploads/images/original_untouched/492/1231804.jpg',
    creator: 'Christopher Storer',
    rating: 8.6,
    genres: ['Comedy', 'Drama'],
    overview: 'A young chef from the fine dining world comes home to Chicago to run his family Italian beef sandwich shop.',
    source: 'seed',
  },
  {
    imdbID: 'tt7366338',
    title: 'Chernobyl',
    year: '2019',
    type: 'series',
    poster: 'https://static.tvmaze.com/uploads/images/original_untouched/341/854930.jpg',
    creator: 'Craig Mazin',
    rating: 9.3,
    genres: ['Drama', 'History', 'Thriller'],
    overview: 'In April 1986, an explosion at the Chernobyl nuclear power plant in the USSR becomes one of the world’s worst man-made catastrophes.',
    source: 'seed',
  },
  {
    imdbID: 'tt1375666',
    title: 'Inception',
    year: '2010',
    type: 'movie',
    poster: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg',
    director: 'Christopher Nolan',
    rating: 8.8,
    genres: ['Action', 'Adventure', 'Sci-Fi'],
    overview: 'A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea.',
    source: 'seed',
  },
  {
    imdbID: 'tt0816692',
    title: 'Interstellar',
    year: '2014',
    type: 'movie',
    poster: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    director: 'Christopher Nolan',
    rating: 8.7,
    genres: ['Adventure', 'Drama', 'Sci-Fi'],
    overview: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity’s survival.',
    source: 'seed',
  },
  {
    imdbID: 'tt0903747',
    title: 'Breaking Bad',
    year: '2008–2013',
    type: 'series',
    poster: 'https://static.tvmaze.com/uploads/images/original_untouched/501/1253519.jpg',
    creator: 'Vince Gilligan',
    rating: 9.5,
    genres: ['Crime', 'Drama', 'Thriller'],
    overview: 'A chemistry teacher diagnosed with cancer turns to manufacturing methamphetamine to secure his family’s future.',
    source: 'seed',
  },
  {
    imdbID: 'tt0468569',
    title: 'The Dark Knight',
    year: '2008',
    type: 'movie',
    poster: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    director: 'Christopher Nolan',
    rating: 9.0,
    genres: ['Action', 'Crime', 'Drama'],
    overview: 'Batman raises the stakes in his war on crime with the help of Lt. Jim Gordon and DA Harvey Dent.',
    source: 'seed',
  },
  {
    imdbID: 'tt6751668',
    title: 'Parasite',
    year: '2019',
    type: 'movie',
    poster: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    director: 'Bong Joon-ho',
    rating: 8.5,
    genres: ['Drama', 'Thriller', 'Comedy'],
    overview: 'Greed and class discrimination threaten the newly formed symbiotic relationship between two families.',
    source: 'seed',
  },
  {
    imdbID: 'tt1856010',
    title: 'Blade Runner 2049',
    year: '2017',
    type: 'movie',
    poster: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/gKkl37BQuKTanygYQG1pyYgLVgf.jpg',
    director: 'Denis Villeneuve',
    rating: 8.0,
    genres: ['Sci-Fi', 'Mystery', 'Drama'],
    overview: 'A young blade runner’s discovery of a long-buried secret leads him to track down former blade runner Rick Deckard.',
    source: 'seed',
  },
  {
    imdbID: 'tt0944947',
    title: 'Game of Thrones',
    year: '2011–2019',
    type: 'series',
    poster: 'https://static.tvmaze.com/uploads/images/original_untouched/498/1245274.jpg',
    creator: 'David Benioff & D.B. Weiss',
    rating: 9.2,
    genres: ['Action', 'Adventure', 'Drama'],
    overview: 'Nine noble families fight for control over the lands of Westeros, while an ancient enemy returns.',
    source: 'seed',
  },
  {
    imdbID: 'tt4574334',
    title: 'Stranger Things',
    year: '2016–2025',
    type: 'series',
    poster: 'https://static.tvmaze.com/uploads/images/original_untouched/499/1249767.jpg',
    creator: 'The Duffer Brothers',
    rating: 8.7,
    genres: ['Drama', 'Fantasy', 'Horror'],
    overview: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments and terrifying supernatural forces.',
    source: 'seed',
  },
  {
    imdbID: 'tt2356777',
    title: 'True Detective',
    year: '2014–',
    type: 'series',
    poster: 'https://static.tvmaze.com/uploads/images/original_untouched/490/1226764.jpg',
    creator: 'Nic Pizzolatto',
    rating: 8.9,
    genres: ['Crime', 'Drama', 'Mystery'],
    overview: 'Seasonal anthology series in which police investigations unearth the personal and professional secrets of those involved.',
    source: 'seed',
  },
  {
    imdbID: 'tt2802850',
    title: 'Fargo',
    year: '2014–',
    type: 'series',
    poster: 'https://static.tvmaze.com/uploads/images/original_untouched/487/1219631.jpg',
    creator: 'Noah Hawley',
    rating: 8.9,
    genres: ['Crime', 'Drama', 'Thriller'],
    overview: 'Various chronicles of deception, intrigue and murder in and around frozen Minnesota.',
    source: 'seed',
  },
  {
    imdbID: 'tt0098936',
    title: 'Twin Peaks',
    year: '1990–1991',
    type: 'series',
    poster: 'https://static.tvmaze.com/uploads/images/original_untouched/397/992910.jpg',
    creator: 'David Lynch & Mark Frost',
    rating: 8.8,
    genres: ['Crime', 'Drama', 'Mystery'],
    overview: 'An idiosyncratic FBI agent investigates the murder of a young woman in the even more idiosyncratic town of Twin Peaks.',
    source: 'seed',
  },
  {
    imdbID: 'tt2085059',
    title: 'Black Mirror',
    year: '2011–',
    type: 'series',
    poster: 'https://static.tvmaze.com/uploads/images/original_untouched/464/1161208.jpg',
    creator: 'Charlie Brooker',
    rating: 8.7,
    genres: ['Drama', 'Sci-Fi', 'Thriller'],
    overview: 'An anthology series exploring a twisted, high-tech multiverse where humanity’s greatest innovations collide.',
    source: 'seed',
  },
  {
    imdbID: 'tt0306414',
    title: 'The Wire',
    year: '2002–2008',
    type: 'series',
    poster: 'https://static.tvmaze.com/uploads/images/original_untouched/483/1209355.jpg',
    creator: 'David Simon',
    rating: 9.3,
    genres: ['Crime', 'Drama', 'Thriller'],
    overview: 'The Baltimore drug scene, as seen through the eyes of drug dealers and law enforcement.',
    source: 'seed',
  },
];

/* ------------------------------------------------------------------ */
/* SOURCE 1: TVMaze Public API (Keyless, Instant TV Series)            */
/* ------------------------------------------------------------------ */
interface TVMazeShow {
  id: number;
  name: string;
  premiered?: string;
  genres?: string[];
  runtime?: number;
  averageRuntime?: number;
  image?: { medium?: string; original?: string };
  summary?: string;
  rating?: { average?: number };
  externals?: { imdb?: string };
  network?: { name?: string };
  webChannel?: { name?: string };
}

interface TVMazeSearchItem {
  score: number;
  show: TVMazeShow;
}

export async function fetchTVMazeSearch(query: string, signal?: AbortSignal): Promise<MediaSummary[]> {
  try {
    const res = await fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`, { signal });
    if (!res.ok) return [];
    const data = (await res.json()) as TVMazeSearchItem[];
    return data
      .filter((item) => Boolean(item.show?.name))
      .map<MediaSummary>((item) => {
        const s = item.show;
        const imdb = s.externals?.imdb ? (s.externals.imdb.startsWith('tt') ? s.externals.imdb : `tt${s.externals.imdb}`) : `tvmaze-${s.id}`;
        return {
          imdbID: imdb,
          title: s.name,
          year: s.premiered ? s.premiered.slice(0, 4) : '',
          type: 'series',
          poster: s.image?.original ?? s.image?.medium ?? null,
          director: s.network?.name ?? s.webChannel?.name ?? undefined,
          rating: s.rating?.average ?? null,
          genres: s.genres ?? [],
          overview: stripHtml(s.summary),
          source: 'tvmaze',
        };
      });
  } catch {
    return [];
  }
}

/* ------------------------------------------------------------------ */
/* SOURCE 2: Apple iTunes Search API (Keyless, Instant Feature Films)  */
/* ------------------------------------------------------------------ */
interface ITunesTrack {
  trackId: number;
  trackName: string;
  releaseDate?: string;
  kind?: string;
  wrapperType?: string;
  artworkUrl100?: string;
  artistName?: string;
  primaryGenreName?: string;
  trackTimeMillis?: number;
  longDescription?: string;
  shortDescription?: string;
}

interface ITunesResponse {
  resultCount: number;
  results: ITunesTrack[];
}

export async function fetchITunesMovies(query: string, signal?: AbortSignal): Promise<MediaSummary[]> {
  try {
    // Search movies directly or general track search
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=movie&limit=25`;
    const res = await fetch(url, { signal });
    if (!res.ok) return [];
    const data = (await res.json()) as ITunesResponse;
    return (data.results ?? [])
      .filter((t) => Boolean(t.trackName))
      .map<MediaSummary>((t) => ({
        imdbID: `itunes-${t.trackId}`,
        title: t.trackName,
        year: t.releaseDate ? t.releaseDate.slice(0, 4) : '',
        type: 'movie',
        poster: upgradeItunesArtwork(t.artworkUrl100),
        director: t.artistName,
        rating: null,
        genres: t.primaryGenreName ? [t.primaryGenreName] : [],
        overview: t.longDescription || t.shortDescription || '',
        source: 'itunes',
      }));
  } catch {
    return [];
  }
}

/* ------------------------------------------------------------------ */
/* SOURCE 3: OMDb & TMDB Layer (Enriched if keys present)             */
/* ------------------------------------------------------------------ */
interface OmdbItem {
  imdbID: string;
  Title: string;
  Year: string;
  Type: MediaType;
  Poster: string;
}

export async function fetchOMDb(query: string, type?: MediaType | 'all', year?: string, signal?: AbortSignal): Promise<MediaSummary[]> {
  if (!isOmdbConfigured) return [];
  try {
    const params = new URLSearchParams({ apikey: OMDB_KEY!, s: query });
    if (type && type !== 'all') params.set('type', type);
    if (year) params.set('y', year);
    const res = await fetch(`${OMDB_URL}?${params}`, { signal });
    if (!res.ok) return [];
    const data = await res.json();
    if (data.Response === 'False') return [];
    return (data.Search ?? []).map((i: OmdbItem) => ({
      imdbID: i.imdbID,
      title: i.Title,
      year: i.Year,
      type: i.Type || 'movie',
      poster: i.Poster && i.Poster !== 'N/A' ? i.Poster : null,
      source: 'omdb' as const,
    }));
  } catch {
    return [];
  }
}

/* ------------------------------------------------------------------ */
/* UNIFIED MULTI-SOURCE AGGREGATOR ENGINE                              */
/* ------------------------------------------------------------------ */
export async function aggregateMediaSearch(filters: SearchFilters, signal?: AbortSignal): Promise<SearchResponse> {
  const q = filters.query.trim();

  // If query is empty, return popular / featured curated + trending
  if (!q) {
    const seed = CURATED_MASTERPIECES.filter((m) => {
      if (filters.type !== 'all' && m.type !== filters.type) return false;
      if (filters.year && !m.year.startsWith(filters.year)) return false;
      return true;
    });
    return {
      results: seed,
      total: seed.length,
      isDemo: true,
      sourcesUsed: ['Curated Masterpieces Pool', 'TVMaze', 'Apple iTunes'],
    };
  }

  // Filter curated seed matches first for instant high-res match
  const seedMatches = CURATED_MASTERPIECES.filter((m) => {
    if (filters.type !== 'all' && m.type !== filters.type) return false;
    if (filters.year && !m.year.startsWith(filters.year)) return false;
    const titleMatch = m.title.toLowerCase().includes(q.toLowerCase());
    const genreMatch = m.genres?.some((g) => g.toLowerCase().includes(q.toLowerCase()));
    return titleMatch || genreMatch;
  });

  // Query TVMaze, iTunes, and OMDb concurrently
  const promises: Promise<MediaSummary[]>[] = [];
  const sourcesUsed: string[] = ['Curated Pool'];

  // Source 1: TVMaze (TV Shows)
  if (filters.type === 'all' || filters.type === 'series') {
    sourcesUsed.push('TVMaze Public API');
    promises.push(fetchTVMazeSearch(q, signal));
  }

  // Source 2: Apple iTunes (Feature Films)
  if (filters.type === 'all' || filters.type === 'movie') {
    sourcesUsed.push('Apple iTunes API');
    promises.push(fetchITunesMovies(q, signal));
  }

  // Source 3: OMDb (if configured)
  if (isOmdbConfigured) {
    sourcesUsed.push('OMDb API');
    promises.push(fetchOMDb(q, filters.type, filters.year, signal));
  }

  const settled = await Promise.allSettled(promises);
  const liveResults: MediaSummary[] = [];

  for (const s of settled) {
    if (s.status === 'fulfilled' && Array.isArray(s.value)) {
      liveResults.push(...s.value);
    }
  }

  // Merge and deduplicate by normalized title + year or imdbID
  const seenKeys = new Set<string>();
  const merged: MediaSummary[] = [];

  // Seed matches have highest quality artwork, prioritize them first
  for (const item of [...seedMatches, ...liveResults]) {
    const key = item.imdbID && !item.imdbID.startsWith('itunes-') && !item.imdbID.startsWith('tvmaze-')
      ? item.imdbID
      : `${normalizeTitle(item.title)}_${item.year.slice(0, 4)}_${item.type}`;

    if (!seenKeys.has(key)) {
      seenKeys.add(key);

      // Filter by type and year if provided
      if (filters.type !== 'all' && item.type !== filters.type) continue;
      if (filters.year && !item.year.startsWith(filters.year)) continue;

      merged.push(item);
    }
  }

  return {
    results: merged,
    total: merged.length,
    isDemo: !isOmdbConfigured,
    sourcesUsed,
  };
}

/** Detail lookup enriched with runtime, cast, director, and plot */
export async function getAggregatedDetails(media: MediaSummary, signal?: AbortSignal): Promise<MediaDetails> {
  // Check curated hero/masterpiece first
  const curated = CURATED_MASTERPIECES.find((m) => m.imdbID === media.imdbID || m.title.toLowerCase() === media.title.toLowerCase());
  if (curated) {
    return {
      ...media,
      genres: curated.genres ?? ['Drama'],
      runtimeMinutes: media.type === 'movie' ? 120 : 55,
      plot: curated.overview || media.overview || '',
      imdbRating: curated.rating ?? null,
      totalSeasons: media.type === 'series' ? 4 : null,
      totalEpisodes: media.type === 'series' ? 40 : null,
      director: curated.director || curated.creator,
    };
  }

  // If TVMaze show, fetch direct metadata
  if (media.type === 'series' && media.imdbID) {
    try {
      const res = await fetch(`https://api.tvmaze.com/singlesearch/shows?q=${encodeURIComponent(media.title)}&embed=cast`, { signal });
      if (res.ok) {
        const data = await res.json();
        return {
          ...media,
          poster: data.image?.original ?? media.poster,
          genres: data.genres ?? [],
          runtimeMinutes: data.runtime ?? data.averageRuntime ?? 50,
          plot: stripHtml(data.summary) || media.overview || '',
          imdbRating: data.rating?.average ?? null,
          totalSeasons: 3,
          totalEpisodes: 30,
          network: data.network?.name ?? data.webChannel?.name,
          cast: (data._embedded?.cast ?? []).slice(0, 4).map((c: { person?: { name?: string } }) => c.person?.name ?? ''),
        };
      }
    } catch {
      // Fallback below
    }
  }

  return {
    ...media,
    genres: media.genres ?? [],
    runtimeMinutes: media.type === 'movie' ? 115 : 45,
    plot: media.overview || 'A cinematic production tracked on CinePulse.',
    imdbRating: media.rating ?? null,
    totalSeasons: media.type === 'series' ? 3 : null,
    totalEpisodes: media.type === 'series' ? 30 : null,
  };
}
