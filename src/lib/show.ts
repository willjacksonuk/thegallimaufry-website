// The Show: the podcast as a whole, as the site describes it

export const name = "The Gallimaufry";

export const description =
  "Two enthusiasts of the past explore the weird, the overlooked, and the occasionally ridiculous. New episodes monthly, crafted in a carpet shop basement.";

// Astro fills this from `site` in astro.config.mjs
export const url: string = import.meta.env.SITE;

export const rssFeed = "https://feeds.buzzsprout.com/1460611.rss";

export const defaultImage = "https://thegallimaufry.show/og-default.jpg";

export const listenOn = [
  { label: "Apple Podcasts", href: "https://podcasts.apple.com/podcast/id1541207040" },
  { label: "Spotify", href: "https://open.spotify.com/show/4QO6YrQMbF8KtgpGCjmlQZ" },
  {
    label: "Amazon Music",
    href: "https://music.amazon.com/podcasts/275087d3-2808-4d10-a949-e3c193ea0e92",
  },
  { label: "RSS", href: rssFeed },
] as const;
