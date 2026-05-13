# The Gallimaufry – Website

Website for [The Gallimaufry](https://thegallimaufry.show) - a history podcast about the weird, the wonderful, and the often overlooked. Hosted by two lovers of history from the basement of a south-west London carpet shop. Currently on hiatus, with new episodes expected soon.

The site is a work in progress, but will eventually replace the existing Buzzsprout-hosted page at [thegallimaufry.show](https://thegallimaufry.show). Functional but unstyled for now. Design, branding, and additional features are in progress.

While built for The Gallimaufry, the project could be adapted for any Buzzsprout-hosted podcast.

---

## Tech Stack

- [Astro](https://astro.build): static site generator
- [TypeScript](https://www.typescriptlang.org): add type safety to JavaScript
- [Buzzsprout API](https://www.buzzsprout.com/api): retrieve episode data on build
- [url-slug](https://www.npmjs.com/package/url-slug): generate URL-friendly slugs from episode titles

---

## Getting Started

### Prerequisites

- Node.js 18 or above
- A Buzzsprout account with an API token

### Installation

```bash
git clone https://github.com/willjacksonuk/thegallimaufry-website.git
cd thegallimaufry-website
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```
BUZZSPROUT_API_TOKEN=your_token_here
BUZZSPROUT_PODCAST_ID=your_podcast_id_here
```

### Development

```bash
npm run dev
```

Open `http://localhost:4321`.

### Build

```bash
npm run build
npm run preview
```

---

## Project Structure

```
src/
├── lib/
│   └── buzzsprout.ts    # API helper functions
├── pages/
│   ├── index.astro      # Episode listing
│   └── episodes/
│       └── [slug].astro # Individual episode pages
└── types/
    └── episode.ts       # TypeScript interface for Buzzsprout API response
```

---

## License

The source code is licensed under the [MIT License](LICENSE).

Podcast content, artwork, and audio © The Gallimaufry. All rights reserved.