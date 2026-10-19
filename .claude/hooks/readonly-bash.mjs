#!/usr/bin/env node
// PreToolUse hook (matcher: Bash) para el subagente adversarial-reviewer.
// Solo deja pasar comandos de lectura. Lo demás se bloquea con exit 2 y el
// motivo va por stderr, que Claude Code le devuelve al agente.

import { readFileSync } from 'node:fs'

const input = JSON.parse(readFileSync(0, 'utf8'))
const command = input?.tool_input?.command ?? ''

function block(reason) {
  process.stderr.write(
    `adversarial-reviewer es de solo lectura. Comando bloqueado: ${reason}\n` +
      'Usa Read/Grep/Glob o comandos de lectura (git diff/log/show, gh pr view/diff/checks, grep, cat...).\n'
  )
  process.exit(2)
}

if (/\$\(|`/.test(command)) block('sustitución de comandos ($(...) o `...`)')

// Parte el comando en segmentos por |, ||, &&, ; y saltos de línea, respetando comillas.
function splitSegments(cmd) {
  const segments = []
  let current = ''
  let quote = null
  for (let i = 0; i < cmd.length; i++) {
    const c = cmd[i]
    if (quote) {
      if (c === '\\' && quote === '"') {
        current += c + (cmd[++i] ?? '')
        continue
      }
      if (c === quote) quote = null
      current += c
      continue
    }
    if (c === "'" || c === '"') {
      quote = c
      current += c
      continue
    }
    if (c === '\\') {
      current += c + (cmd[++i] ?? '')
      continue
    }
    if (c === '|' || c === ';' || c === '\n' || (c === '&' && cmd[i + 1] === '&')) {
      if (c === '&' || (c === '|' && cmd[i + 1] === '|')) i++
      segments.push(current)
      current = ''
      continue
    }
    if (c === '&') block('ejecución en segundo plano (&)')
    if (c === '>') {
      // Solo se permite descartar salida: 2>&1, >/dev/null, 2>/dev/null
      const rest = cmd.slice(i)
      const ok = rest.match(/^>&[12]|^>\s*\/dev\/null/)
      if (!ok) block('redirección a archivo (>)')
      current += ok[0]
      i += ok[0].length - 1
      continue
    }
    current += c
  }
  if (quote) block('comillas sin cerrar')
  segments.push(current)
  return segments.map((s) => s.trim()).filter(Boolean)
}

function tokens(segment) {
  return (segment.match(/'[^']*'|"(?:\\.|[^"])*"|\S+/g) ?? []).map((t) =>
    t.replace(/^(['"])(.*)\1$/s, '$2')
  )
}

const SIMPLE_READERS = new Set([
  'cat', 'head', 'tail', 'grep', 'egrep', 'rg', 'ls', 'wc', 'sort', 'uniq', 'cut', 'tr',
  'diff', 'file', 'stat', 'pwd', 'echo', 'printf', 'nl', 'basename', 'dirname',
  'realpath', 'tree', 'which', 'true', 'test', '[', 'cd',
])

const GIT_READ = new Set([
  'diff', 'log', 'show', 'status', 'blame', 'rev-parse', 'merge-base', 'ls-files',
  'grep', 'cat-file', 'describe', 'shortlog', 'rev-list', 'name-rev', 'ls-tree',
])

const GH_READ = {
  pr: new Set(['view', 'diff', 'checks', 'list', 'status']),
  issue: new Set(['view', 'list']),
  repo: new Set(['view']),
  run: new Set(['view', 'list']),
}

function checkSegment(segment) {
  // Variables de entorno delante del comando (FOO=bar cmd): se ignoran.
  const t = tokens(segment).filter((tok, i, all) => !(/^\w+=/.test(tok) && all.slice(0, i).every((x) => /^\w+=/.test(x))))
  if (t.length === 0) return
  const [cmd, ...args] = t

  if (SIMPLE_READERS.has(cmd)) return

  if (cmd === 'sed') {
    if (args.some((a) => /^-i|^--in-place/.test(a))) block('sed -i')
    if (!args.includes('-n')) block('sed sin -n (usa sed -n para leer)')
    if (args.some((a) => /(^|;)\s*\d*,?\d*\s*w\s|\/w\s/.test(a))) block('sed con escritura (w)')
    return
  }

  if (cmd === 'find') {
    const bad = args.find((a) => /^-(delete|exec|execdir|ok|okdir|fprint|fprint0|fprintf|fls)$/.test(a))
    if (bad) block(`find ${bad}`)
    return
  }

  if (cmd === 'git') {
    let rest = args
    while (rest[0] === '-C' || rest[0] === '--no-pager' || rest[0] === '-c') {
      rest = rest[0] === '--no-pager' ? rest.slice(1) : rest.slice(2)
    }
    const [sub, ...subArgs] = rest
    if (sub === 'branch') {
      // Sin argumento posicional, o con él solo tras un filtro de listado.
      const listing = ['--list', '-l', '--contains', '--merged', '--no-merged', '--points-at']
      const readFlags = new Set(['--show-current', '-a', '-r', '-v', '-vv', '--all', '--remotes', ...listing])
      const ok = subArgs.every((a, i) => readFlags.has(a) || (!a.startsWith('-') && listing.includes(subArgs[i - 1])))
      if (ok) return
      block('git branch que crea, borra o mueve ramas')
    }
    if (sub === 'remote' && subArgs.every((a) => a === '-v')) return
    if (!GIT_READ.has(sub)) block(`git ${sub ?? ''}`.trim())
    if (subArgs.some((a) => a.startsWith('--output'))) block('git --output')
    return
  }

  if (cmd === 'gh') {
    const [group, action] = args
    if (GH_READ[group]?.has(action)) return
    block(`gh ${group ?? ''} ${action ?? ''}`.trim())
  }

  if (cmd === 'npm') {
    const rest = args[0] === '--prefix' ? args.slice(2) : args
    if (rest[0] === 'run' && ['lint', 'typecheck'].includes(rest[1])) return
    block(`npm ${rest.join(' ')}`)
  }

  if (cmd === 'npx' && ['oxlint', 'eslint'].includes(args[0]) && !args.includes('--fix')) return
  if (cmd === 'npx' && args[0] === 'tsc' && args.includes('--noEmit')) return

  block(cmd)
}

for (const segment of splitSegments(command)) checkSegment(segment)
process.exit(0)
