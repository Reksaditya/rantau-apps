import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  webpack: (config) => {
    const oneOfRule = config.module?.rules?.find(
      (rule: { oneOf?: unknown[] }) => Array.isArray(rule?.oneOf)
    );
    if (oneOfRule && Array.isArray(oneOfRule.oneOf)) {
      for (const rule of oneOfRule.oneOf) {
        if (rule.use && Array.isArray(rule.use)) {
          const hasCssLoader = rule.use.some(
            (u: { loader?: string } | string) => {
              const loaderStr = typeof u === "string" ? u : u?.loader ?? "";
              return (
                loaderStr.includes("css-loader") &&
                !loaderStr.includes("error-loader")
              );
            }
          );
          if (hasCssLoader) {
            rule.use.push(require.resolve("@tailwindcss/turbopack"));
          }
        }
      }
    }
    return config;
  },
};

export default nextConfig;
