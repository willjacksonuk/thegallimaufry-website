# The Gallimaufry – Website
Website for [The Gallimaufry](https://thegallimaufry.show) – a history podcast about the weird, the wonderful, and the often overlooked. Hosted by two lovers of history from the basement of a south-west London carpet shop.

---

## Tech Stack
- [Astro](https://astro.build): static site generator
- [TypeScript](https://www.typescriptlang.org): type-safe JavaScript
- [Dokploy](https://dokploy.com): self-hosted deployment
- [Buzzsprout API](https://www.buzzsprout.com/api): episode data retrieved at build time
- [Lettermint](https://lettermint.co): transactional email
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
BUZZSPROUT_API_TOKEN=your_buzzsprout_api_token
BUZZSPROUT_PODCAST_ID=your_buzzsprout_podcast_id
FROM_EMAIL=enquiries@thegallimaufry.show
TO_EMAIL=info@thegallimaufry.show
LETTERMINT_API_TOKEN=your_lettermint_api_token
TURNSTILE_SITE_KEY=1x00000000000000000000AA
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
```
The Turnstile values above are Cloudflare's always-pass test keys for local
development. Create a real widget (Managed mode, hostname `thegallimaufry.show`)
under **Turnstile** in the Cloudflare dashboard for production.

### Development
```bash
npm run dev
```
Open `http://localhost:4321`.

Run the tests with:
```bash
npm test
```

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
| `LETTERMINT_API_TOKEN` | Secret | Build validation and contact-form email at runtime |
| `BUZZSPROUT_PODCAST_ID` | Argument | Podcast to fetch during the build |
| `FROM_EMAIL` | Argument | Verified Lettermint sender address |
| `TO_EMAIL` | Argument | Contact-form recipient |
| `TURNSTILE_SITE_KEY` | Argument | Public Turnstile key, built into the contact page |
| `TURNSTILE_SECRET_KEY` | Secret | Verifies the contact-form spam check at runtime |

In Dokploy, enter the three secrets under **Build-time Secrets** and the other
four under **Build-time Arguments**. Also enter all seven in the application's
normal Environment tab so they are present when the server starts.

Add `thegallimaufry.show` in the application's Domains tab, route `/` to
container port `4321`, and enable HTTPS. Test the Dokploy-generated preview
domain before changing DNS. When ready, change the domain's DNS record to the
Dokploy server and remove the old Cloudflare Pages/Workers project only after
the site and contact form have been verified.

---

## Contact form spam protection
Enquiries that look like spam are silently dropped: the sender sees the normal
success message, and the reason is logged to the container (no message content).
An enquiry is dropped when:
- the hidden `website` honeypot field is filled in
- it was sent less than 3 seconds after the page loaded
- both the name and the message look like random strings
- the Cloudflare Turnstile check fails

The rules live in `src/lib/enquiry.ts`, with tests alongside in `src/lib/enquiry.test.ts`.

If Turnstile can't load or sending fails, the form shows an error with the
enquiries email address instead.

The browser half lives in `src/scripts/contact-form.ts`, with tests alongside in
`src/scripts/contact-form.test.ts`. Send is disabled while an enquiry is
sending, so a double click can't send it twice.

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
