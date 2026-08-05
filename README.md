# The Gallimaufry – Website
Website for [The Gallimaufry](https://thegallimaufry.show) – a history podcast about the weird, the wonderful, and the often overlooked. Hosted by two lovers of history from the basement of a south-west London carpet shop.

---

## Tech Stack
- [Astro](https://astro.build): static site generator
- [TypeScript](https://www.typescriptlang.org): type-safe JavaScript
- [Dokploy](https://dokploy.com): self-hosted deployment
- [Buzzsprout API](https://www.buzzsprout.com/api): episode data retrieved at build time
- [Resend](https://resend.com): transactional email
- [vanilla-cookieconsent](https://cookieconsent.orestbida.com): cookie consent management
- [url-slug](https://www.npmjs.com/package/url-slug): URL-friendly slugs from episode titles

---

## Getting Started

### Prerequisites
- Node.js 22 or above
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

## Deploying with Dokploy

Create a Dokploy **Application** from this repository and use these settings:

- Build type: `Dockerfile`
- Dockerfile path: `Dockerfile`
- Docker context path: `.`
- Container port: `4321`

Add these as both application environment variables and build-time values:

| Variable | Build setting | Purpose |
| --- | --- | --- |
| `BUZZSPROUT_API_TOKEN` | Secret | Fetch episodes without putting the token in the image |
| `RESEND_API_KEY` | Secret | Build validation and contact-form email at runtime |
| `BUZZSPROUT_PODCAST_ID` | Argument | Podcast to fetch during the build |
| `FROM_EMAIL` | Argument | Verified Resend sender address |
| `TO_EMAIL` | Argument | Contact-form recipient |

In Dokploy, enter the two secrets under **Build-time Secrets** and the other
three under **Build-time Arguments**. Also enter all five in the application's
normal Environment tab so they are present when the server starts.

Add `thegallimaufry.show` in the application's Domains tab, route `/` to
container port `4321`, and enable HTTPS. Test the Dokploy-generated preview
domain before changing DNS. When ready, change the domain's DNS record to the
Dokploy server and remove the old Cloudflare Pages/Workers project only after
the site and contact form have been verified.

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
