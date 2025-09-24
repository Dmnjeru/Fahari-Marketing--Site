/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl: "https://faharidairies.co.ke",
  generateRobotsTxt: true, // generates robots.txt file
  sitemapSize: 7000,
  changefreq: "daily",
  priority: 0.7,

  // 🚫 exclude private/admin routes
  exclude: [
    "/admin/*",
    "/api/*",
  ],

  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api"],
      },
    ],
    additionalSitemaps: [
      "https://faharidairies.co.ke/sitemap.xml",
    ],
  },
};

export default config;
