import type { Episode } from "../types/episode";
import {
  BUZZSPROUT_API_TOKEN,
  BUZZSPROUT_PODCAST_ID,
} from "astro:env/server";

export async function getEpisodes(): Promise<Episode[]> {
  const response = await fetch(
    `https://www.buzzsprout.com/api/${BUZZSPROUT_PODCAST_ID}/episodes.json`,
    {
      headers: {
        Authorization: `Token token=${BUZZSPROUT_API_TOKEN}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Buzzsprout API error: ${response.status}`);
  }

  const episodes: Episode[] = await response.json();

  return episodes.sort(
    (a, b) =>
      new Date(b.published_at).getTime() - new Date(a.published_at).getTime(),
  );
}

export async function getEpisode(id: number): Promise<Episode> {
  const response = await fetch(
    `https://www.buzzsprout.com/api/${BUZZSPROUT_PODCAST_ID}/episodes/${id}.json`,
    {
      headers: {
        Authorization: `Token token=${BUZZSPROUT_API_TOKEN}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Buzzsprout API error: ${response.status}`);
  }

  return response.json();
}