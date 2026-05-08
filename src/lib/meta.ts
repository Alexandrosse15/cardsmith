import fs from 'fs'
import path from 'path'

export interface DeckCard {
  quantity: number
  name: string
}

export interface MetaDeck {
  id: string
  name: string
  tier: number
  winRate: string
  archetype: string
  colors: string[]
  mainboard: DeckCard[]
  sideboard: DeckCard[]
}

export interface MetaFormat {
  format: string
  updatedAt: string
  decks: MetaDeck[]
}

const META_DIR = path.join(process.cwd(), 'src', 'content', 'meta')

export const FORMATS: Record<string, { id: string; label: string }[]> = {
  magic: [
    { id: 'standard', label: 'Standard' },
    { id: 'pioneer', label: 'Pioneer' },
    { id: 'modern', label: 'Modern' },
    { id: 'commander', label: 'Commander' },
  ],
  lorcana: [
    { id: 'core', label: 'Core' },
  ],
  pokemon: [
    { id: 'standard', label: 'Standard' },
  ],
  lor: [
    { id: 'standard', label: 'Standard' },
  ],
}

export async function getMetaFormat(game: string, formatId: string): Promise<MetaFormat | null> {
  const filePath = path.join(META_DIR, game, `${formatId}.json`)
  if (!fs.existsSync(filePath)) return null
  const raw = fs.readFileSync(filePath, 'utf-8')
  return JSON.parse(raw) as MetaFormat
}
