#!/usr/bin/env node
// PostToolUse hook (Edit|Write|MultiEdit): formatea con Prettier el archivo
// recién editado, solo si está dentro de frontend/src/ de ESTE repo.
// Cualquier otro archivo (backend, raíz, otra copia del proyecto) se ignora.

import { readFileSync, existsSync, realpathSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { dirname, join, relative, isAbsolute, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

// La raíz sale de la ubicación del script (.claude/hooks/), no del cwd.
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
const frontendDir = join(repoRoot, 'frontend')
const srcDir = join(frontendDir, 'src')
const prettierBin = join(frontendDir, 'node_modules', '.bin', 'prettier')

const EXTENSIONS = /\.(tsx?|jsx?|mjs|cjs|css|scss|json|html|md)$/i

let input
try {
  input = JSON.parse(readFileSync(0, 'utf8'))
} catch {
  process.exit(0)
}

const filePath = input?.tool_input?.file_path
if (!filePath || !EXTENSIONS.test(filePath)) process.exit(0)

const absolute = isAbsolute(filePath) ? filePath : resolve(input.cwd ?? process.cwd(), filePath)
if (!existsSync(absolute)) process.exit(0)

// realpath para que un symlink no saque el formateo fuera de frontend/src.
const real = realpathSync(absolute)
const rel = relative(realpathSync(srcDir), real)
if (rel === '' || rel.startsWith('..') || isAbsolute(rel) || rel.split(sep).includes('node_modules')) {
  process.exit(0)
}

if (!existsSync(prettierBin)) {
  process.stderr.write('Prettier no está instalado en frontend/ (npm install en frontend/).\n')
  process.exit(0)
}

try {
  execFileSync(prettierBin, ['--write', '--log-level', 'warn', real], {
    cwd: frontendDir,
    stdio: ['ignore', 'ignore', 'pipe'],
  })
} catch (error) {
  // Error de sintaxis u otro fallo: se avisa a Claude (exit 2 en PostToolUse
  // no deshace la edición, solo le pasa el mensaje).
  process.stderr.write(`Prettier no pudo formatear ${relative(repoRoot, real)}:\n${error.stderr ?? error.message}\n`)
  process.exit(2)
}
