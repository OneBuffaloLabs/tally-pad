/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://tallypad.onebuffalolabs.com',
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
  },
  outDir: './out',
};
