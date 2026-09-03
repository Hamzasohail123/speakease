import { MetadataRoute } from 'next';

const siteUrl = 'https://speakease-frontend.vercel.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Authenticated app screens have nothing for a crawler to index and no
      // public content — keep them out of the crawl budget.
      disallow: ['/dashboard', '/speak', '/topics', '/history', '/feedback', '/profile'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
