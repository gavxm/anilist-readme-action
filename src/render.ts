/**
 * Markdown renderer.
 *
 * Converts AniList data into a formatted markdown snippet.
 * Supports two styles:
 *   - "compact": simple bullet lists
 *   - "full": tables with cover images, progress bars, and scores
 */

import { AniListData, MediaEntry } from "./anilist";

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

/** Formats progress as "3/12 ep" for anime or "45/200 ch" for manga. */
function progressText(entry: MediaEntry): string {
  const total =
    entry.type === "ANIME" ? entry.totalEpisodes : entry.totalChapters;
  const unit = entry.type === "ANIME" ? "ep" : "ch";
  const totalStr = total ? `/${total}` : "";
  return `${entry.progress}${totalStr} ${unit}`;
}

/** Formats a score like "8/10", or returns empty string if unscored. */
function scoreText(score: number | null): string {
  return score ? ` - ${score}/10` : "";
}

// ---------------------------------------------------------------------------
// List renderers
// ---------------------------------------------------------------------------

/** Renders entries as a simple markdown bullet list. */
function renderListCompact(entries: MediaEntry[]): string {
  if (entries.length === 0) return "_Nothing here yet._\n";
  return (
    entries
      .map(
        (e) =>
          `- [${e.title}](${e.url}) (${progressText(e)}${scoreText(e.score)})`,
      )
      .join("\n") + "\n"
  );
}

/** Renders entries as a markdown table with cover images. */
function renderListFull(entries: MediaEntry[], showProgress: boolean): string {
  if (entries.length === 0) return "_Nothing here yet._\n";

  const header = showProgress
    ? "| | Title | Progress | Score |\n|---|---|---|---|\n"
    : "| | Title | Score |\n|---|---|---|\n";

  const rows = entries.map((e) => {
    const img = `<img src="${e.coverImage}" width="40">`;
    const link = `[${e.title}](${e.url})`;
    if (showProgress) {
      return `| ${img} | ${link} | ${progressText(e)} | ${scoreText(e.score).replace(" - ", "")} |`;
    }
    return `| ${img} | ${link} | ${scoreText(e.score).replace(" - ", "")} |`;
  });

  return header + rows.join("\n") + "\n";
}

// ---------------------------------------------------------------------------
// Main renderer
// ---------------------------------------------------------------------------

/**
 * Assembles the full markdown snippet from AniList data.
 * Output includes three sections: stats table, current list, and recently completed.
 */
export function renderMarkdown(
  data: AniListData,
  style: "compact" | "full",
): string {
  const lines: string[] = [];
  const { stats } = data;

  // Stats summary - always shown as a compact two-column table
  lines.push("### AniList Stats\n");
  lines.push(`| Anime | Manga |`);
  lines.push(`|---|---|`);
  lines.push(`| ${stats.animeCount} watched | ${stats.mangaCount} read |`);
  lines.push(
    `| ${stats.animeDaysWatched} days | ${stats.mangaChaptersRead} chapters |`,
  );
  lines.push(
    `| ${stats.animeMeanScore} avg score | ${stats.mangaMeanScore} avg score |`,
  );
  lines.push("");

  // Currently watching/reading - only shown if the user has active entries
  if (data.current.length > 0) {
    lines.push("### Currently Watching / Reading\n");
    if (style === "compact") {
      lines.push(renderListCompact(data.current));
    } else {
      lines.push(renderListFull(data.current, true));
    }
    lines.push("");
  }

  // Recently completed - only shown if the user has finished titles
  if (data.recentlyCompleted.length > 0) {
    lines.push("### Recently Completed\n");
    if (style === "compact") {
      lines.push(renderListCompact(data.recentlyCompleted));
    } else {
      lines.push(renderListFull(data.recentlyCompleted, false));
    }
    lines.push("");
  }

  return lines.join("\n").trimEnd() + "\n";
}
