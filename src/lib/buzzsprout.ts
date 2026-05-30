import type { Episode } from "../types/episode";

const PODCAST_ID = import.meta.env.BUZZSPROUT_PODCAST_ID;
const API_TOKEN = import.meta.env.BUZZSPROUT_API_TOKEN;

export async function getEpisodes(): Promise<Episode[]> {
  const response = await fetch(
    `https://www.buzzsprout.com/api/${PODCAST_ID}/episodes.json`,
    {
      headers: {
        Authorization: `Token token=${API_TOKEN}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Buzzsprout API error: ${response.status}`);
  }

  const episodes: Episode[] = await response.json();

  // Return episodes, newest first
  return episodes.sort(
    (a, b) =>
      new Date(b.published_at).getTime() - new Date(a.published_at).getTime(),
  );
}

export async function getEpisode(id: number): Promise<Episode> {
  const response = await fetch(
    `https://www.buzzsprout.com/api/${PODCAST_ID}/episodes/${id}.json`,
    {
      headers: {
        Authorization: `Token token=${API_TOKEN}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Buzzsprout API error: ${response.status}`);
  }

  return response.json();
}

/* Take the duration in seconds and convert it into easily readable minutes and seconds */
export function durationToReadable(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes} mins`;
}

export function durationToIso(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor(seconds % 3600 / 60);
  const s = Math.floor(seconds % 60);
  return `PT${h > 0 ? `${h}H` : "" }${m}M${s}S`;
}


/* Format the date */
export function dateToReadable(publishDate: string): string {
  const formattedDate = new Date(publishDate).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return formattedDate;
}
