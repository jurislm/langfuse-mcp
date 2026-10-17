import { describe, expect, it } from 'bun:test'
import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = new URL('../../', import.meta.url)
const readJson = (name: string) => JSON.parse(readFileSync(new URL(name, root), 'utf8'))
const pkg = readJson('package.json')
const excludePaths: string[] = readJson('release-please-config.json')
  .packages['.']['exclude-paths'].map((path: string) => path.replace(/^\//, '').replace(/\/$/, ''))

const skipsFile = (excluded: string, file: string) => excluded === '.' || file.startsWith(`${excluded}/`)

const packedFiles = (): string[] => {
  const output = execFileSync('npm', ['pack', '--dry-run', '--json', '--ignore-scripts'], {
    cwd: fileURLToPath(root),
    encoding: 'utf8',
  })
  return JSON.parse(output)[0].files.map((file: { path: string }) => file.path)
}

const bundledSourceFiles = (): string[] => {
  const entry: string = pkg.scripts.build.match(/bun build (\S+)/)[1]
  const sourceDir = entry.split('/')[0]
  return readdirSync(new URL(sourceDir, root), { recursive: true, encoding: 'utf8' })
    .map((file) => `${sourceDir}/${file}`)
    .filter((file) => statSync(new URL(file, root)).isFile())
}

describe('release-please exclude-paths', () => {
  it('never skips a commit that changes a file npm publishes or the source bundled into dist', () => {
    const files = [...packedFiles(), ...bundledSourceFiles()]
    expect(files).toContain('package.json')
    expect(files).toContain('src/index.ts')
    const conflicts = excludePaths.flatMap((excluded) =>
      files.filter((file) => skipsFile(excluded, file)).map((file) => `${excluded} ↔ ${file}`),
    )
    expect(conflicts).toEqual([])
  })

  it('lists only canonical existing subdirectories, because release-please matches exclude-paths by literal directory prefix', () => {
    const invalid = excludePaths.filter((path) => {
      const canonical = path.split('/').every((segment) => /^[\w.-]+$/.test(segment) && !/^\.\.?$/.test(segment))
      const dir = join(fileURLToPath(root), path)
      return !canonical || !existsSync(dir) || !statSync(dir).isDirectory()
    })
    expect(invalid).toEqual([])
  })
})
