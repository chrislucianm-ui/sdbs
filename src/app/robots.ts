import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/dashboard", "/api"],
    },
    sitemap: "https://stdbintercollege.org/sitemap.xml",
  };
}
