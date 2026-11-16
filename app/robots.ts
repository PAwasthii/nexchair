import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/admin-v2/", "/api/"],
    },
    sitemap: "https://www.nexchair.in/sitemap.xml",
  };
}
