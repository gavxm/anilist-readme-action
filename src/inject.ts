/**
 * README injector.
 *
 * Finds the <!-- anilist:start --> and <!-- anilist:end --> markers in a README
 * and replaces everything between them with the generated AniList content.
 * The markers themselves are preserved so future runs can update the same section.
 */

const START_MARKER = "<!-- anilist:start -->";
const END_MARKER = "<!-- anilist:end -->";

/**
 * Replaces the content between the AniList markers in the README.
 * Throws if markers are missing or in the wrong order.
 */
export function injectSection(readme: string, content: string): string {
  const startIdx = readme.indexOf(START_MARKER);
  const endIdx = readme.indexOf(END_MARKER);

  if (startIdx === -1 || endIdx === -1) {
    throw new Error(
      `Could not find AniList markers in README. Add these markers where you want the content:\n${START_MARKER}\n${END_MARKER}`,
    );
  }

  if (startIdx >= endIdx) {
    throw new Error(
      "Start marker must appear before end marker in the README.",
    );
  }

  // Keep everything before the start marker and after the end marker
  const before = readme.substring(0, startIdx + START_MARKER.length);
  const after = readme.substring(endIdx);

  return `${before}\n${content}\n${after}`;
}
