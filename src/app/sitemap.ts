import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://stdbintercollege.org";

  const urls = [
    { url: baseUrl, changeFrequency: "daily" as const, priority: 1.0 },
    { url: `${baseUrl}/about`, changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${baseUrl}/updates`, changeFrequency: "daily" as const, priority: 0.8 },
    { url: `${baseUrl}/why-us`, changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${baseUrl}/academics`, changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${baseUrl}/student-life`, changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${baseUrl}/campus-tour`, changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${baseUrl}/admissions`, changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${baseUrl}/contact`, changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${baseUrl}/gallery`, changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${baseUrl}/announcements`, changeFrequency: "daily" as const, priority: 0.8 },
    { url: `${baseUrl}/notices`, changeFrequency: "daily" as const, priority: 0.8 },
  ];

  return urls.map(item => ({
    url: item.url,
    lastModified: new Date(),
    changeFrequency: item.changeFrequency,
    priority: item.priority,
  }));
}
