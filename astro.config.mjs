// @ts-check
import { defineConfig, fontProviders } from "astro/config";

import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://thegallimaufry.show",
  fonts: [
    {
      provider: fontProviders.local(),
      name: "Lato",
      cssVariable: "--tg-font-lato",
      fallbacks: ["sans-serf"],
      options: {
        variants: [
          { weight: "300", src: ["./src/assets/fonts/Lato-Light.woff2"] },
          { weight: "400", src: ["./src/assets/fonts/Lato-Regular.woff2"] },
          { weight: "700", src: ["./src/assets/fonts/Lato-Bold.woff2"] },
        ],
      },
    },
  ],

  integrations: [sitemap()],
});