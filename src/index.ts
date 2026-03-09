/**
 * Entry point for the AniList README GitHub Action.
 *
 * Pipeline: read action inputs -> fetch AniList data -> render markdown -> inject into README.
 * The action writes the updated README to disk.
 * A separate commit step is needed to push the change.
 */

import * as core from "@actions/core";
import { fetchAniListData } from "./anilist";
import { renderMarkdown } from "./render";
import { injectSection } from "./inject";
import * as fs from "fs";
import * as path from "path";

const VALID_STYLES = ["compact", "full"] as const;
type DisplayStyle = (typeof VALID_STYLES)[number];

async function run(): Promise<void> {
  try {
    // Read and validate action inputs
    const username = core.getInput("anilist_username", { required: true });

    const readmePath = core.getInput("readme_path") || "README.md";

    const styleInput = core.getInput("display_style") || "full";
    if (!VALID_STYLES.includes(styleInput as DisplayStyle)) {
      throw new Error(
        `Invalid display_style "${styleInput}". Must be "compact" or "full".`,
      );
    }
    const displayStyle = styleInput as DisplayStyle;

    const maxItemsRaw = core.getInput("max_items") || "5";
    const maxItems = parseInt(maxItemsRaw, 10);
    if (isNaN(maxItems) || maxItems < 1) {
      throw new Error(
        `Invalid max_items "${maxItemsRaw}". Must be a positive integer.`,
      );
    }

    // Fetch data from AniList's public GraphQL API
    core.info(`Fetching AniList data for user: ${username}`);
    const data = await fetchAniListData(username, maxItems);
    core.info(
      `Found ${data.current.length} current and ${data.recentlyCompleted.length} completed entries`,
    );

    // Render the markdown and inject it between the markers in the README
    const markdown = renderMarkdown(data, displayStyle);

    const fullPath = path.resolve(readmePath);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`README not found at path: ${readmePath}`);
    }
    const readme = fs.readFileSync(fullPath, "utf-8");
    const updated = injectSection(readme, markdown);

    // Skip writing if nothing changed (avoids empty commits)
    if (updated === readme) {
      core.info("README is already up to date - no changes needed.");
      return;
    }

    fs.writeFileSync(fullPath, updated, "utf-8");
    core.info("README updated successfully.");
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.setFailed("An unexpected error occurred");
    }
  }
}

run();
