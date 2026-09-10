import type { MetadataRoute } from "next";

const routes = ["", "/en", "/about", "/en/about", "/faq", "/en/faq", "/contact", "/en/contact", "/privacy", "/en/privacy"];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `https://dyeloty.pl${route}`,
    lastModified: new Date(),
  }));
}
