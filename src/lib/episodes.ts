import convert from "url-slug";
import type { BuzzsproutEpisode } from "../types/episode";
import * as show from "./show";

// An Episode ready for the site's pages
export interface Episode {
  id: number;
  title: string;
  number: number | null;
  season: number | null;
  slug: string;
  path: string;
  url: string;
  publishedAt: string;
  readableDate: string;
  readableLength: string;
  isoDuration: string;
  descriptionHtml: string;
  plainDescription: string | undefined;
  artworkUrl: string | undefined;
  audioUrl: string;
  jsonLd: Record<string, unknown>;
}

export interface EpisodeSource {
  fetchAll(): Promise<BuzzsproutEpisode[]>;
}

export interface EpisodeCatalogue {
  all(): Promise<Episode[]>;
}

export function createEpisodeCatalogue(source: EpisodeSource): EpisodeCatalogue {
  let episodesPromise: Promise<Episode[]> | null = null;

  return {
    all() {
      episodesPromise ??= source.fetchAll().then(toEpisodes);
      return episodesPromise;
    },
  };
}

function toEpisodes(raw: BuzzsproutEpisode[]): Episode[] {
  const episodes = [...raw]
    .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
    .map(toEpisode);

  // Each Episode has one page, so two sharing a slug would silently lose a page
  const titlesBySlug = new Map<string, string>();
  for (const episode of episodes) {
    const existing = titlesBySlug.get(episode.slug);
    if (existing !== undefined) {
      throw new Error(
        `Two episodes share the slug "${episode.slug}": "${existing}" and "${episode.title}"`,
      );
    }
    titlesBySlug.set(episode.slug, episode.title);
  }

  return episodes;
}

function toEpisode(raw: BuzzsproutEpisode): Episode {
  const slug = slugFor(raw.title);
  const path = `/episodes/${slug}`;
  const url = `${show.url}${path}`;
  const plainDescription = toPlainDescription(raw.description);
  const isoDuration = durationToIso(raw.duration);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "PodcastEpisode",
    url,
    name: raw.title,
    description: plainDescription,
    datePublished: raw.published_at,
    duration: isoDuration,
    associatedMedia: {
      "@type": "MediaObject",
      contentUrl: raw.audio_url,
      encodingFormat: "audio/mpeg",
    },
    partOfSeries: {
      "@type": "PodcastSeries",
      name: show.name,
      url: show.url,
    },
    ...(raw.episode_number && { episodeNumber: raw.episode_number }),
    ...(raw.season_number && { seasonNumber: raw.season_number }),
    ...(raw.artwork_url && { image: raw.artwork_url }),
  };

  return {
    id: raw.id,
    title: raw.title,
    number: raw.episode_number,
    season: raw.season_number,
    slug,
    path,
    url,
    publishedAt: raw.published_at,
    readableDate: dateToReadable(raw.published_at),
    readableLength: durationToReadable(raw.duration),
    isoDuration,
    descriptionHtml: raw.description,
    plainDescription,
    artworkUrl: raw.artwork_url || undefined,
    audioUrl: raw.audio_url,
    jsonLd,
  };
}

function slugFor(title: string): string {
  return convert(title, { dictionary: { Æ: "A" } });
}

function toPlainDescription(description: string): string | undefined {
  return description
    ? description
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .trim()
        .slice(0, 155)
    : undefined;
}

function durationToReadable(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes} mins`;
}

function durationToIso(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  return `PT${h > 0 ? `${h}H` : ""}${m}M${s}S`;
}

function dateToReadable(publishDate: string): string {
  return new Date(publishDate).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
