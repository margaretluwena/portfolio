/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // No remote domains needed — all images are self-hosted in /public
  },
  env: {
    // stamped at build time for the footer's "Last updated" line (MM-DD-YY)
    NEXT_PUBLIC_BUILD_DATE: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' }).replace(/\//g, '-'),
  },
}

module.exports = nextConfig
