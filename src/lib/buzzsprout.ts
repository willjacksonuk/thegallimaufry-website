import { BUZZSPROUT_API_TOKEN, BUZZSPROUT_PODCAST_ID } from "astro:env/server";
import type { BuzzsproutEpisode } from "../types/episode";
import { createEpisodeCatalogue, type EpisodeSource } from "./episodes";

export function createBuzzsproutSource({
  podcastId,
  apiToken,
}: {
  podcastId: string;
  apiToken: string;
}): EpisodeSource {
  return {
    async fetchAll() {
      const response = await fetch(`https://www.buzzsprout.com/api/${podcastId}/episodes.json`, {
        headers: {
          Authorization: `Token token=${apiToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Buzzsprout API error: ${response.status}`);
      }

      const episodes: BuzzsproutEpisode[] = await response.json();
      return episodes;
    },
  };
}

export const episodeCatalogue = createEpisodeCatalogue(
  createBuzzsproutSource({
    podcastId: BUZZSPROUT_PODCAST_ID,
    apiToken: BUZZSPROUT_API_TOKEN,
  }),
);
