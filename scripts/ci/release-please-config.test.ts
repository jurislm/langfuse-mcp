import { describe, expect, it } from 'bun:test'
import { existsSync, readFileSync, statSync } from 'node:fs'

const root = new URL('../../', import.meta.url)
const readJson = (name: string) => JSON.parse(readFileSync(new URL(name, root), 'utf8'))

const pkg = readJson('package.json')
const excludePaths: string[] = readJson('release-please-config.json').packages['.']['exclude-paths']
const buildEntry: string = pkg.scripts.build.match(/bun build (\S+)/)[1]
const shippedPaths: string[] = [...pkg.files, 'package.json', 'README.md', buildEntry.split('/')[0]]

const overlaps = (a: string, b: string) => a === b || a.startsWith(`${b}/`) || b.startsWith(`${a}/`)

describe('release-please exclude-paths', () => {
  it('never skips a commit that changes a published file or the source bundled into dist', () => {
    const conflicts = excludePaths.flatMap((excluded) =>
      shippedPaths.filter((shipped) => overlaps(excluded, shipped)).map((shipped) => `${excluded} ↔ ${shipped}`),
    )
    expect(conflicts).toEqual([])
  })

  it('lists only existing directories, because release-please matches exclude-paths by directory prefix', () => {
    const notDirectories = excludePaths.filter((path) => {
      const url = new URL(path, root)
      return !existsSync(url) || !statSync(url).isDirectory()
    })
    expect(notDirectories).toEqual([])
  })
})
