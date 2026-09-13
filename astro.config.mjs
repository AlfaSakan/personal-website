import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://alfasakan.github.io",
  base: "/personal-website/",
  output: "static",
  integrations: [react(), sitemap()],
  vite: { plugins: [tailwindcss()] },
});
