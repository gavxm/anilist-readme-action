import { describe, it, expect } from "vitest";
import { renderMarkdown } from "./render";
import { AniListData } from "./anilist";

const mockStats = {
  animeDaysWatched: 42.5,
  animeCount: 150,
  animeMeanScore: 7.8,
  mangaChaptersRead: 3200,
  mangaCount: 45,
  mangaMeanScore: 8.1,
};

const mockEntry = {
  title: "Frieren",
  url: "https://anilist.co/anime/154587",
  type: "ANIME" as const,
  progress: 8,
  totalEpisodes: 28,
  totalChapters: null,
  coverImage: "https://example.com/cover.jpg",
  score: 9,
};

const mockManga = {
  title: "One Piece",
  url: "https://anilist.co/manga/13",
  type: "MANGA" as const,
  progress: 1100,
  totalEpisodes: null,
  totalChapters: null,
  coverImage: "https://example.com/op.jpg",
  score: null,
};

describe("renderMarkdown", () => {
  it("renders stats table", () => {
    const data: AniListData = {
      current: [],
      recentlyCompleted: [],
      stats: mockStats,
    };

    const md = renderMarkdown(data, "full");

    expect(md).toContain("### AniList Stats");
    expect(md).toContain("150 watched");
    expect(md).toContain("45 read");
    expect(md).toContain("42.5 days");
    expect(md).toContain("3200 chapters");
    expect(md).toContain("7.8 avg score");
    expect(md).toContain("8.1 avg score");
  });

  it("renders current entries in full style with table", () => {
    const data: AniListData = {
      current: [mockEntry],
      recentlyCompleted: [],
      stats: mockStats,
    };

    const md = renderMarkdown(data, "full");

    expect(md).toContain("### Currently Watching / Reading");
    expect(md).toContain("| Title |");
    expect(md).toContain("[Frieren]");
    expect(md).toContain("8/28 ep");
    expect(md).toContain("9/10");
    expect(md).toContain('<img src="https://example.com/cover.jpg"');
  });

  it("renders current entries in compact style with bullet list", () => {
    const data: AniListData = {
      current: [mockEntry],
      recentlyCompleted: [],
      stats: mockStats,
    };

    const md = renderMarkdown(data, "compact");

    expect(md).toContain("- [Frieren]");
    expect(md).toContain("8/28 ep");
    expect(md).not.toContain("| Title |");
  });

  it("omits sections with no entries", () => {
    const data: AniListData = {
      current: [],
      recentlyCompleted: [],
      stats: mockStats,
    };

    const md = renderMarkdown(data, "full");

    expect(md).not.toContain("Currently Watching");
    expect(md).not.toContain("Recently Completed");
  });

  it("renders recently completed without progress column", () => {
    const data: AniListData = {
      current: [],
      recentlyCompleted: [mockEntry],
      stats: mockStats,
    };

    const md = renderMarkdown(data, "full");

    expect(md).toContain("### Recently Completed");
    expect(md).toContain("[Frieren]");
    // Completed table should not have a Progress column
    const completedSection = md.split("### Recently Completed")[1];
    expect(completedSection).not.toContain("| Progress |");
  });

  it("handles entries with no score", () => {
    const data: AniListData = {
      current: [mockManga],
      recentlyCompleted: [],
      stats: mockStats,
    };

    const md = renderMarkdown(data, "compact");

    expect(md).toContain("[One Piece]");
    expect(md).toContain("1100 ch");
    expect(md).not.toContain("/10");
  });

  it("handles manga progress with unknown total chapters", () => {
    const data: AniListData = {
      current: [mockManga],
      recentlyCompleted: [],
      stats: mockStats,
    };

    const md = renderMarkdown(data, "compact");

    // Should show "1100 ch" without a total
    expect(md).toContain("1100 ch");
    expect(md).not.toContain("1100/");
  });
});
