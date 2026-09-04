import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import("next").NextConfig} */
const nextConfig = {
  outputFileTracingRoot: path.join(__dirname, "../../"),
  webpack: (config) => {
    // Explicit @ alias — ensures @/lib/* resolves to apps/web/lib/* regardless
    // of Vercel's rootDirectory or working-directory settings.
    config.resolve.alias["@"] = __dirname;
    return config;
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1",
    NEXT_PUBLIC_AIDE_API_URL: process.env.NEXT_PUBLIC_AIDE_API_URL ?? "https://nlt-app-aide.joshdorsey.workers.dev",
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
