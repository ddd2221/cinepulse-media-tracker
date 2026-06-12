import type { MediaDetails, MediaSummary, MediaType, SearchFilters, SearchResponse } from '../types/media';

const OMDB_URL = 'https://www.omdbapi.com/';
const API_KEY = (import.meta.env.VITE_OMDB_API_KEY as string | undefined)?.trim();

export const isOmdbConfigured = Boolean(API_KEY) && API_KEY !== 'your-omdb-key';

/* ------------------------------------------------------------------ */
/* Demo catalogue – used when no API key is set or the network fails.  */
/* ------------------------------------------------------------------ */
const d = (
  imdbID: string,
  title: string,
  year: string,
  type: MediaType,
  genres: string[],
  runtimeMinutes: number,
  imdbRating: number,
  plot: string,
  totalSeasons: number | null = null,
  totalEpisodes: number | null = null,
): MediaDetails => ({ imdbID, title, year, type, poster: null, genres, runtimeMinutes, imdbRating, plot, totalSeasons, totalEpisodes });

export const MOCK_CATALOGUE: MediaDetails[] = [
  d('tt0903747', 'Breaking Bad', '2008–2013', 'series', ['Crime', 'Drama', 'Thriller'], 47, 9.5, 'A chemistry teacher diagnosed with cancer turns to manufacturing methamphetamine to secure his family’s future.', 5, 62),
  d('tt0944947', 'Game of Thrones', '2011–2019', 'series', ['Action', 'Adventure', 'Drama'], 57, 9.2, 'Nine noble families fight for control over the lands of Westeros.', 8, 73),
  d('tt4574334', 'Stranger Things', '2016–2025', 'series', ['Drama', 'Fantasy', 'Horror'], 51, 8.7, 'Strange events in a small town reveal secret experiments and a mysterious girl with powers.', 5, 42),
  d('tt2861424', 'Rick and Morty', '2013–', 'series', ['Animation', 'Adventure', 'Comedy'], 23, 9.1, 'An alcoholic genius and his anxious grandson travel across dimensions.', 8, 81),
  d('tt7366338', 'Chernobyl', '2019', 'series', ['Drama', 'History', 'Thriller'], 65, 9.3, 'The 1986 nuclear disaster and the cleanup that followed.', 1, 5),
  d('tt5491994', 'Planet Earth II', '2016', 'series', ['Documentary', 'Adventure'], 50, 9.5, 'Wildlife filmed in stunning detail across the world’s habitats.', 1, 6),
  d('tt0306414', 'The Wire', '2002–2008', 'series', ['Crime', 'Drama', 'Thriller'], 59, 9.3, 'Baltimore drug scene seen through the eyes of dealers and law enforcement.', 5, 60),
  d('tt2085059', 'Black Mirror', '2011–', 'series', ['Drama', 'Sci-Fi', 'Thriller'], 60, 8.7, 'Anthology series exploring a twisted, high-tech multiverse.', 7, 33),
  d('tt1375666', 'Inception', '2010', 'movie', ['Action', 'Adventure', 'Sci-Fi'], 148, 8.8, 'A thief who steals secrets through dream-sharing is given the inverse task of planting an idea.'),
  d('tt0816692', 'Interstellar', '2014', 'movie', ['Adventure', 'Drama', 'Sci-Fi'], 169, 8.7, 'Explorers travel through a wormhole in space to ensure humanity’s survival.'),
  d('tt0468569', 'The Dark Knight', '2008', 'movie', ['Action', 'Crime', 'Drama'], 152, 9.0, 'Batman faces the Joker, a criminal mastermind who plunges Gotham into anarchy.'),
  d('tt0133093', 'The Matrix', '1999', 'movie', ['Action', 'Sci-Fi'], 136, 8.7, 'A hacker learns the true nature of reality and his role in the war against its controllers.'),
  d('tt1160419', 'Dune', '2021', 'movie', ['Action', 'Adventure', 'Drama'], 155, 8.0, 'Paul Atreides travels to the dangerous desert planet Arrakis.'),
  d('tt6751668', 'Parasite', '2019', 'movie', ['Comedy', 'Drama', 'Thriller'], 132, 8.5, 'Greed and class discrimination threaten the newly formed bond between two families.'),
  d('tt1745960', 'Top Gun: Maverick', '2022', 'movie', ['Action', 'Drama'], 130, 8.2, 'After thirty years, Maverick trains a detachment of graduates for a special mission.'),
  d('tt15398776', 'Oppenheimer', '2023', 'movie', ['Biography', 'Drama', 'History'], 180, 8.3, 'The story of J. Robert Oppenheimer and the creation of the atomic bomb.'),
  d('tt0959621', 'Breaking Bad: Pilot', '2008', 'episode', ['Crime', 'Drama', 'Thriller'], 58, 9.0, 'Walter White begins his transformation after a shocking diagnosis.'),
  d('tt1514246', 'Stranger Things: Chapter One', '2016', 'episode', ['Drama', 'Fantasy', 'Horror'], 48, 8.5, 'A boy vanishes and the town begins to uncover something unnatural.'),
];

const toSummary = ({ imdbID, title, year, type, poster }: MediaDetails): MediaSummary => ({ imdbID, title, year, type, poster });

function searchMock(filters: SearchFilters): SearchResponse {
  const q = filters.query.trim().toLowerCase();
  const matches = MOCK_CATALOGUE.filter((m) => {
    if (filters.type !== 'all' && m.type !== filters.type) return false;
    if (filters.year && !m.year.startsWith(filters.year)) return false;
    return q === '' || m.title.toLowerCase().includes(q) || m.genres.some((g) => g.toLowerCase().includes(q));
  });
  return { results: matches.map(toSummary), total: matches.length, isDemo: true };
}

/** Featured titles shown before the user types anything. */
export function getFeaturedMock(): MediaSummary[] {
  return MOCK_CATALOGUE.filter((m) => m.type !== 'episode').map(toSummary);
}

/* ------------------------------------------------------------------ */
/* OMDb helpers                                                        */
/* ------------------------------------------------------------------ */
interface OmdbSearchItem { imdbID: string; Title: string; Year: string; Type: MediaType; Poster: string }
interface OmdbSearchPayload { Response: 'True' | 'False'; Search?: OmdbSearchItem[]; totalResults?: string; Error?: string }
interface OmdbDetailPayload {
  Response: 'True' | 'False'; imdbID: string; Title: string; Year: string; Type: MediaType; Poster: string;
  Genre: string; Runtime: string; Plot: string; imdbRating: string; totalSeasons?: string;
}

const parseNumber = (value: string | undefined): number | null => {
  const n = Number.parseFloat(value ?? '');
  return Number.isFinite(n) ? n : null;
};

export async function searchMedia(filters: SearchFilters, signal?: AbortSignal): Promise<SearchResponse> {
  const query = filters.query.trim();
  if (!isOmdbConfigured) return searchMock(filters);
  if (query.length < 2) return { results: [], total: 0, isDemo: false };

  const params = new URLSearchParams({ apikey: API_KEY!, s: query });
  if (filters.type !== 'all') params.set('type', filters.type);
  if (filters.year) params.set('y', filters.year);

  try {
    const res = await fetch(`${OMDB_URL}?${params}`, { signal });
    if (!res.ok) throw new Error(`OMDb responded with ${res.status}`);
    const data = (await res.json()) as OmdbSearchPayload;
    if (data.Response === 'False') {
      return { results: [], total: 0, isDemo: false, error: data.Error === 'Movie not found!' ? undefined : data.Error };
    }
    const results = (data.Search ?? []).map<MediaSummary>((i) => ({
      imdbID: i.imdbID, title: i.Title, year: i.Year, type: i.Type, poster: i.Poster === 'N/A' ? null : i.Poster,
    }));
    return { results, total: parseNumber(data.totalResults) ?? results.length, isDemo: false };
  } catch (err) {
    if ((err as Error).name === 'AbortError') throw err;
    // Network / quota failure -> graceful fallback to the demo catalogue.
    return { ...searchMock(filters), error: 'OMDb unreachable – showing demo data.' };
  }
}

export async function getMediaDetails(summary: MediaSummary, signal?: AbortSignal): Promise<MediaDetails> {
  const mock = MOCK_CATALOGUE.find((m) => m.imdbID === summary.imdbID);
  if (mock) return mock;

  const fallback: MediaDetails = {
    ...summary, genres: [], runtimeMinutes: summary.type === 'movie' ? 100 : 45,
    plot: '', imdbRating: null, totalSeasons: null, totalEpisodes: null,
  };
  if (!isOmdbConfigured) return fallback;

  try {
    const res = await fetch(`${OMDB_URL}?${new URLSearchParams({ apikey: API_KEY!, i: summary.imdbID, plot: 'short' })}`, { signal });
    const data = (await res.json()) as OmdbDetailPayload;
    if (data.Response === 'False') return fallback;
    const seasons = parseNumber(data.totalSeasons);
    return {
      ...summary,
      genres: data.Genre && data.Genre !== 'N/A' ? data.Genre.split(',').map((g) => g.trim()) : [],
      runtimeMinutes: parseNumber(data.Runtime) ?? fallback.runtimeMinutes,
      plot: data.Plot === 'N/A' ? '' : data.Plot,
      imdbRating: parseNumber(data.imdbRating),
      totalSeasons: seasons,
      totalEpisodes: seasons ? Math.round(seasons * 10) : null,
    };
  } catch {
    return fallback;
  }
}
