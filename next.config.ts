import createMDX from '@next/mdx'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cards.scryfall.io' },
      { protocol: 'https', hostname: 'c1.scryfall.com' },
      { protocol: 'https', hostname: 'svgs.scryfall.io' },
      { protocol: 'https', hostname: 'cards.lorcast.io' },
      { protocol: 'http', hostname: 'dd.b.pvp.net' },
      { protocol: 'https', hostname: 'dd.b.pvp.net' },
      { protocol: 'https', hostname: 'images.pokemontcg.io' },
      { protocol: 'https', hostname: 'cdn.riftscribe.gg' },
    ],
  },
}

const withMDX = createMDX({})

export default withMDX(nextConfig)
