/**
 * AniList API client.
 *
 * Fetches a user's current watching/reading list, recently completed titles,
 * and overall stats from the public AniList GraphQL API (no auth required).
 */

const ANILIST_API = "https://graphql.anilist.co";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A single anime or manga entry from a user's list. */
export interface MediaEntry {
  title: string;
  url: string;
  type: "ANIME" | "MANGA";
  progress: number;
  totalEpisodes: number | null;
  totalChapters: number | null;
  coverImage: string;
  score: number | null;
}

/** Aggregated lifetime stats for a user's anime and manga activity. */
export interface UserStats {
  animeDaysWatched: number;
  animeCount: number;
  animeMeanScore: number;
  mangaChaptersRead: number;
  mangaCount: number;
  mangaMeanScore: number;
}

/** Combined data returned by fetchAniListData(). */
export interface AniListData {
  current: MediaEntry[];
  recentlyCompleted: MediaEntry[];
  stats: UserStats;
}

// ---------------------------------------------------------------------------
// GraphQL queries
// ---------------------------------------------------------------------------

/** Fetches anime and manga the user is currently watching/reading. */
const CURRENT_LIST_QUERY = `
query ($username: String) {
  anime: MediaListCollection(userName: $username, type: ANIME, status: CURRENT, sort: UPDATED_TIME_DESC) {
    lists {
      entries {
        progress
        score(format: POINT_10)
        media {
          title { romaji }
          siteUrl
          episodes
          coverImage { medium }
        }
      }
    }
  }
  manga: MediaListCollection(userName: $username, type: MANGA, status: CURRENT, sort: UPDATED_TIME_DESC) {
    lists {
      entries {
        progress
        score(format: POINT_10)
        media {
          title { romaji }
          siteUrl
          chapters
          coverImage { medium }
        }
      }
    }
  }
}`;

/** Fetches anime and manga the user has completed (most recent first). */
const COMPLETED_QUERY = `
query ($username: String) {
  anime: MediaListCollection(userName: $username, type: ANIME, status: COMPLETED, sort: UPDATED_TIME_DESC) {
    lists {
      entries {
        score(format: POINT_10)
        media {
          title { romaji }
          siteUrl
          episodes
          coverImage { medium }
        }
      }
    }
  }
  manga: MediaListCollection(userName: $username, type: MANGA, status: COMPLETED, sort: UPDATED_TIME_DESC) {
    lists {
      entries {
        score(format: POINT_10)
        media {
          title { romaji }
          siteUrl
          chapters
          coverImage { medium }
        }
      }
    }
  }
}`;

/** Fetches aggregate user statistics (total counts, watch time, mean scores). */
const STATS_QUERY = `
query ($username: String) {
  User(name: $username) {
    statistics {
      anime {
        count
        minutesWatched
        meanScore
      }
      manga {
        count
        chaptersRead
        meanScore
      }
    }
  }
}`;

// ---------------------------------------------------------------------------
// API helpers
// ---------------------------------------------------------------------------

interface GqlResponse {
  data?: Record<string, unknown>;
  errors?: Array<{ message: string }>;
}

/** Sends a GraphQL request to the AniList API and returns the data payload. */
async function gql(
  query: string,
  variables: Record<string, string>,
): Promise<Record<string, unknown>> {
  const res = await fetch(ANILIST_API, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    throw new Error(`AniList API returned ${res.status}: ${res.statusText}`);
  }

  const json = (await res.json()) as GqlResponse;
  if (json.errors?.length) {
    throw new Error(`AniList GraphQL error: ${json.errors[0].message}`);
  }
  return json.data!;
}

/**
 * Transforms a raw MediaListCollection response into a flat array of MediaEntry objects.
 * AniList nests entries inside "lists" (one per custom list), so we flatten them here.
 */
function parseEntries(collection: any, type: "ANIME" | "MANGA"): MediaEntry[] {
  const lists = collection?.lists ?? [];
  const entries: MediaEntry[] = [];
  for (const list of lists) {
    for (const entry of list.entries ?? []) {
      entries.push({
        title: entry.media.title.romaji,
        url: entry.media.siteUrl,
        type,
        progress: entry.progress ?? 0,
        totalEpisodes: entry.media.episodes ?? null,
        totalChapters: entry.media.chapters ?? null,
        coverImage: entry.media.coverImage.medium,
        score: entry.score || null,
      });
    }
  }
  return entries;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Fetches all AniList data needed for the README in parallel:
 * current list, recently completed, and user stats.
 */
export async function fetchAniListData(
  username: string,
  maxItems: number,
): Promise<AniListData> {
  // Run all three queries concurrently since they're independent
  const [currentData, completedData, statsData] = await Promise.all([
    gql(CURRENT_LIST_QUERY, { username }),
    gql(COMPLETED_QUERY, { username }),
    gql(STATS_QUERY, { username }),
  ]);

  const current = [
    ...parseEntries(currentData.anime, "ANIME"),
    ...parseEntries(currentData.manga, "MANGA"),
  ].slice(0, maxItems);

  const recentlyCompleted = [
    ...parseEntries(completedData.anime, "ANIME"),
    ...parseEntries(completedData.manga, "MANGA"),
  ].slice(0, maxItems);

  // Convert minutes watched to days for a more readable stat
  const userStats = statsData.User as any;
  const stats: UserStats = {
    animeDaysWatched:
      Math.round((userStats.statistics.anime.minutesWatched / 60 / 24) * 10) /
      10,
    animeCount: userStats.statistics.anime.count,
    animeMeanScore: userStats.statistics.anime.meanScore,
    mangaChaptersRead: userStats.statistics.manga.chaptersRead,
    mangaCount: userStats.statistics.manga.count,
    mangaMeanScore: userStats.statistics.manga.meanScore,
  };

  return { current, recentlyCompleted, stats };
}
