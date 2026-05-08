import createMDX from '@next/mdx'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cards.scryfall.io' },
      { protocol: 'https', hostname: 'c1.scryfall.com' },
      { protocol: 'https', hostname: 'images.lorcania.com' },
      { protocol: 'https', hostname: 'lor.gg' },
      { protocol: 'https', hostname: 'images.pokemontcg.io' },
    ],
  },
}

const withMDX = createMDX({})

export default withMDX(nextConfig)
