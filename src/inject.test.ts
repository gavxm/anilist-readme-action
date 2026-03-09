import { describe, it, expect } from "vitest";
import { injectSection } from "./inject";

describe("injectSection", () => {
  it("replaces content between markers", () => {
    const readme = [
      "# My Profile",
      "<!-- anilist:start -->",
      "old content",
      "<!-- anilist:end -->",
      "Footer",
    ].join("\n");

    const result = injectSection(readme, "new content");

    expect(result).toBe(
      [
        "# My Profile",
        "<!-- anilist:start -->",
        "new content",
        "<!-- anilist:end -->",
        "Footer",
      ].join("\n"),
    );
  });

  it("works when markers are empty (no content between them)", () => {
    const readme =
      "<!-- anilist:start -->\n<!-- anilist:end -->";

    const result = injectSection(readme, "inserted");

    expect(result).toContain("inserted");
    expect(result).toContain("<!-- anilist:start -->");
    expect(result).toContain("<!-- anilist:end -->");
  });

  it("throws when start marker is missing", () => {
    const readme = "no markers here\n<!-- anilist:end -->";
    expect(() => injectSection(readme, "content")).toThrow(
      "Could not find AniList markers",
    );
  });

  it("throws when end marker is missing", () => {
    const readme = "<!-- anilist:start -->\nno end marker";
    expect(() => injectSection(readme, "content")).toThrow(
      "Could not find AniList markers",
    );
  });

  it("throws when markers are in wrong order", () => {
    const readme =
      "<!-- anilist:end -->\n<!-- anilist:start -->";
    expect(() => injectSection(readme, "content")).toThrow(
      "Start marker must appear before end marker",
    );
  });

  it("preserves content outside the markers", () => {
    const readme = [
      "Header above",
      "",
      "<!-- anilist:start -->",
      "<!-- anilist:end -->",
      "",
      "Footer below",
    ].join("\n");

    const result = injectSection(readme, "data");

    expect(result).toContain("Header above");
    expect(result).toContain("Footer below");
  });
});
