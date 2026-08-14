import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const publicRoots = [
  'src/lib/public',
  'src/components/public',
]

const publicPages = [
  'src/app/page.tsx',
  'src/app/about/page.tsx',
  'src/app/platform/page.tsx',
  'src/app/solutions/page.tsx',
  'src/app/customers/page.tsx',
  'src/app/integrations/page.tsx',
  'src/app/marketplace/page.tsx',
  'src/app/pricing/page.tsx',
  'src/app/trust/page.tsx',
  'src/app/contact/page.tsx',
  'src/app/signup/page.tsx',
  'src/app/login/page.tsx',
]

const hiddenVendorNames = [
  'OpenAI',
  'Anthropic',
  'Claude',
  'fal.ai',
  'Resend',
  'Fast2SMS',
  'AiSensy',
  'Sora',
]

function filesUnder(root: string): string[] {
  if (!fs.existsSync(root)) return []
  const stat = fs.statSync(root)
  if (stat.isFile()) return [root]
  return fs.readdirSync(root).flatMap((entry) => filesUnder(path.join(root, entry)))
}

describe('customer-facing provider concealment', () => {
  it('keeps internal vendors out of public source surfaces', () => {
    const files = [
      ...publicRoots.flatMap(filesUnder),
      ...publicPages.filter((file) => fs.existsSync(file)),
    ].filter((file) => /\.(ts|tsx|js|jsx|md|json)$/.test(file))

    const leaks: string[] = []
    for (const file of files) {
      const source = fs.readFileSync(file, 'utf8')
      for (const vendor of hiddenVendorNames) {
        if (source.toLowerCase().includes(vendor.toLowerCase())) leaks.push(`${file}: ${vendor}`)
      }
    }
    expect(leaks, `Internal provider names leaked into public source:\n${leaks.join('\n')}`).toEqual([])
  })
})
