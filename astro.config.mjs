import { defineConfig } from "astro/config";
const basePath = (process.env.BASE_PATH || "").replace(/^\/*|\/*$/g, "");
export default defineConfig({ site: "https://cristal-sagrado.com", base: basePath ? `/${basePath}` : "/", output: "static", build: { format: "directory" } });
