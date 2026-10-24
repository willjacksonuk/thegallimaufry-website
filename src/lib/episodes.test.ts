import { describe, expect, it } from "vitest";
import { createEpisodeCatalogue, type EpisodeSource } from "./episodes";
import type { BuzzsproutEpisode } from "../types/episode";

// Based on the sample episode in src/types/episode.ts
const athelstan = (overrides: Partial<BuzzsproutEpisode> = {}): BuzzsproutEpisode => ({
  id: 16032850,
  title: "Æthelstan, King of the whole of Britain",
  audio_url:
    "https://www.buzzsprout.com/1460611/episodes/16032850-aethelstan-king-of-the-whole-of-britain.mp3",
  artwork_url: "https://storage.buzzsprout.com/incqla2q8fowfm44tpkak7d16cgg",
  description:
    '<p>Think Alfred was great? Check out his grandson. Raised by his badass warrior aunt, Æthelstan was famously pious, a bit of a clever cloggs and a decent fighter. He came to the throne later than most but would have a major impact on the development of England, calling himself the "king of the whole of Britain." Was this really the case? Find out in the pod.</p>',
  summary: "",
  artist: "The Gallimaufry",
  tags: "",
  published_at: "2024-11-04T06:00:00.000-05:00",
  duration: 3312,
  hq: false,
  magic_mastering: true,
  guid: "Buzzsprout-16032850",
  inactive_at: null,
  custom_url: "",
  episode_number: 40,
  season_number: 1,
  episode_type: "full",
  explicit: false,
  private: false,
  total_plays: 106,
  ...overrides,
});

const fakeSource = (episodes: BuzzsproutEpisode[]) => {
  let calls = 0;
  const source: EpisodeSource = {
    async fetchAll() {
      calls++;
      return episodes;
    },
  };
  return { source, calls: () => calls };
};

const catalogueOf = (...episodes: BuzzsproutEpisode[]) =>
  createEpisodeCatalogue(fakeSource(episodes).source);

const only = async (episode: BuzzsproutEpisode) => {
  const [first] = await catalogueOf(episode).all();
  return first;
};

describe("Episode catalogue", () => {
  it("keeps the slug the live site uses", async () => {
    const episode = await only(athelstan());

    expect(episode.slug).toBe("athelstan-king-of-the-whole-of-britain");
    expect(episode.path).toBe("/episodes/athelstan-king-of-the-whole-of-britain");
    expect(episode.url).toBe(
      "https://thegallimaufry.show/episodes/athelstan-king-of-the-whole-of-britain",
    );
  });

  it("sorts episodes newest first", async () => {
    const episodes = await catalogueOf(
      athelstan({ id: 1, title: "Oldest", published_at: "2024-01-01T06:00:00.000-05:00" }),
      athelstan({ id: 3, title: "Newest", published_at: "2024-12-01T06:00:00.000-05:00" }),
      athelstan({ id: 2, title: "Middle", published_at: "2024-06-01T06:00:00.000-05:00" }),
    ).all();

    expect(episodes.map((e) => e.title)).toEqual(["Newest", "Middle", "Oldest"]);
  });

  it("reads lengths under and over an hour", async () => {
    const short = await only(athelstan({ duration: 3312 }));
    const long = await only(athelstan({ duration: 3900 }));

    expect(short.readableLength).toBe("55 mins");
    expect(short.isoDuration).toBe("PT55M12S");
    expect(long.readableLength).toBe("1h 5m");
    expect(long.isoDuration).toBe("PT1H5M0S");
  });

  it("reads the publish date in British English", async () => {
    const episode = await only(athelstan());

    expect(episode.readableDate).toBe("4 November 2024");
  });

  it("strips tags and entities from the plain description and cuts it to 155 characters", async () => {
    const episode = await only(
      athelstan({ description: `<p>Fish &amp; chips&nbsp;&lt;3 &quot;yes&quot;&gt;</p>${"x".repeat(200)}` }),
    );

    expect(episode.plainDescription).toHaveLength(155);
    expect(episode.plainDescription!.startsWith('Fish & chips <3 "yes">x')).toBe(true);
  });

  it("leaves episode number, season number and image out of the JSON-LD when missing", async () => {
    const episode = await only(
      athelstan({ episode_number: null, season_number: null, artwork_url: "" }),
    );

    expect(episode.jsonLd).not.toHaveProperty("episodeNumber");
    expect(episode.jsonLd).not.toHaveProperty("seasonNumber");
    expect(episode.jsonLd).not.toHaveProperty("image");
    expect(episode.artworkUrl).toBeUndefined();

    const full = await only(athelstan());
    expect(full.jsonLd).toMatchObject({
      episodeNumber: 40,
      seasonNumber: 1,
      image: "https://storage.buzzsprout.com/incqla2q8fowfm44tpkak7d16cgg",
    });
  });

  it("rejects two episodes that would share a page address", async () => {
    const catalogue = catalogueOf(athelstan({ id: 1 }), athelstan({ id: 2 }));

    await expect(catalogue.all()).rejects.toThrow(
      /athelstan-king-of-the-whole-of-britain.*Æthelstan, King of the whole of Britain.*Æthelstan, King of the whole of Britain/,
    );
  });

  it("fetches from the source only once", async () => {
    const { source, calls } = fakeSource([athelstan()]);
    const catalogue = createEpisodeCatalogue(source);

    await catalogue.all();
    await catalogue.all();

    expect(calls()).toBe(1);
  });
});
