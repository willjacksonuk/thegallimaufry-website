// @ts-check
import { defineConfig, fontProviders, envField } from "astro/config";

import sitemap from "@astrojs/sitemap";
import robotsTxt from "astro-robots-txt";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  site: "https://thegallimaufry.show",

  experimental: {
    fonts: [
      {
        provider: fontProviders.local(),
        name: "Lato",
        cssVariable: "--tg-font-lato",
        fallbacks: ["sans-serif"],
        variants: [
          { weight: "300", src: ["./src/assets/fonts/Lato-Light.woff2"] },
          { weight: "400", src: ["./src/assets/fonts/Lato-Regular.woff2"] },
          { weight: "700", src: ["./src/assets/fonts/Lato-Bold.woff2"] },
        ],
      },
    ],
  },

  integrations: [sitemap(), robotsTxt()],

  adapter: cloudflare({
    imageService: "compile",
  }),

  env: {
    schema: {
      RESEND_API_KEY: envField.string({
        context: "server",
        access: "secret",
      }),
      FROM_EMAIL: envField.string({
        context: "server",
        access: "secret",
      }),
      TO_EMAIL: envField.string({
        context: "server",
        access: "secret",
      }),
    },
  },
});