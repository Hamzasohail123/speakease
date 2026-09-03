import { MetadataRoute } from 'next';

const siteUrl = 'https://speakease-frontend.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    { url: `${siteUrl}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${siteUrl}/login`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${siteUrl}/register`, lastModified: now, changeFrequency: 'yearly', priority: 0.5 },
  ];
}
