import { atom, read, update } from 'claude-code'
import type { EngineInterface, FsEntry, Register } from 'claude-code'

import type { MementoStatus, MementoTask } from '../types'

// Mirrors hooks/guards.js of the memento-md plugin, so the band and the guards agree.
const SYNC_LAG_MIN = 45
const OPEN_OP_HOURS = 12
const RECENT_HOURS = 12
const PANE = 'memento'
const TITLE = 'Memento'

const status = atom({ plugin: 'memento-panel', key: 'status' } as const, null, {
  shape: 'status-1',
})
const hidden = atom({ plugin: 'memento-panel', key: 'hidden' } as const, '')

// ------------------------------------------------------------------ paths

function sepOf(p: string): string {
  return p.includes('\\') && !p.includes('/') ? '\\' : '/'
}

function join(dir: string, name: string): string {
  const s = sepOf(dir)
  return dir.endsWith(s) ? dir + name : dir + s + name
}

function parent(p: string): string {
  const s = sepOf(p)
  const t = p.length > 1 && p.endsWith(s) ? p.slice(0, -1) : p
  const i = t.lastIndexOf(s)
  if (i < 0) return p
  if (i === 0) return s
  const up = t.slice(0, i)
  return /^[A-Za-z]:$/.test(up) ? up + s : up
}

function baseName(p: string): string {
  const s = sepOf(p)
  const t = p.endsWith(s) ? p.slice(0, -1) : p
  return t.slice(t.lastIndexOf(s) + 1)
}

// ------------------------------------------------------------------ reading

async function readText($: EngineInterface, path: string): Promise<string | null> {
  try {
    return await $.fs.read(path)
  } catch {
    return null
  }
}

async function mtime($: EngineInterface, path: string): Promise<number> {
  try {
    return (await $.fs.stat(path)).mtimeMs
  } catch {
    return 0
  }
}

async function findWorkspace($: EngineInterface, start: string): Promise<{ dir: string; index: string } | null> {
  let dir = start
  for (let depth = 0; depth < 40; depth++) {
    const text = await readText($, join(dir, 'INDEX.md'))
    if (text !== null && (/^# Task Index/m.test(text) || /^mode:\s*(core|full)\s*$/m.test(text))) {
      return { dir, index: text }
    }
    const up = parent(dir)
    if (up === dir) return null
    dir = up
  }
  return null
}

function localTime(date: string, time: string): number {
  const [y, mo, d] = date.split('-').map(Number)
  const [h, mi] = time.split(':').map(Number)
  return new Date(y, mo - 1, d, h, mi).getTime()
}

// An operation opened in OPS_LOG.md (`>`) and never closed (`<`).
function openOperations(text: string, now: number): string[] {
  const open = new Map<string, number>()
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^-\s+(\d{4}-\d{2}-\d{2})\s+(\d{1,2}:\d{2})\s+([<>])\s+(.+)$/)
    if (!m) continue
    const [, date, time, dir, rest] = m
    if (dir === '>') {
      open.set(rest.split(' -> ')[0].trim(), localTime(date, time))
    } else {
      const key = rest.split(':')[0].trim()
      open.delete(key)
      if (key.startsWith('recovery ')) open.delete(key.slice('recovery '.length))
    }
  }
  return [...open.entries()]
    .filter(([, when]) => when && now - when < OPEN_OP_HOURS * 3600e3 && when <= now + 60e3)
    .map(([key]) => key)
}

function activeRows(index: string): { glyph: string; name: string; status: string }[] {
  const out: { glyph: string; name: string; status: string }[] = []
  const start = index.search(/^## Active\s*$/m)
  if (start < 0) return out
  const rest = index.slice(start).split(/\r?\n/).slice(1)
  for (const line of rest) {
    if (/^## /.test(line)) break
    const m = line.match(/^\|\s*(\[[^\]]\])?\s*\[([^\]]+)\]\([^)]*\)\s*\|([^|]*)\|([^|]*)\|/)
    if (m) out.push({ glyph: m[1] ?? '', name: m[2].trim(), status: m[4].trim() })
  }
  return out
}

function nextLine(memory: string | null): string | null {
  if (!memory) return null
  const m = memory.match(/^next:\s*(.+)$/m)
  return m ? m[1].trim() : null
}

function checkpointOf(text: string | null): MementoStatus['checkpoint'] {
  if (!text || !/^status:\s*active\b/m.test(text)) return null
  const op = text.match(/^operation:\s*(.+)$/m)
  const next = text.split(/\r?\n/).find(l => /#\s*<-\s*next/.test(l))
  return {
    operation: op ? op[1].trim().replace(/^["']|["']$/g, '') : 'a long operation',
    next: next ? next.replace(/#\s*<-\s*next.*$/, '').replace(/^\s*-\s*/, '').trim() : null,
  }
}

async function compute($: EngineInterface, cwd: string, now: number): Promise<MementoStatus | null> {
  const ws = await findWorkspace($, cwd)
  if (!ws) return null
  const behind: string[] = []

  const opsLog = await readText($, join(ws.dir, 'OPS_LOG.md'))
  for (const op of opsLog ? openOperations(opsLog, now) : []) {
    behind.push(`operation left open in OPS_LOG.md: ${op}`)
  }

  let entries: readonly FsEntry[] = []
  try {
    entries = await $.fs.list(ws.dir)
  } catch {
    entries = []
  }
  for (const entry of entries) {
    if (entry.kind !== 'dir' || entry.name.startsWith('.')) continue
    const dir = join(ws.dir, entry.name)
    const d = await mtime($, join(dir, 'DECISIONS.md'))
    const m = await mtime($, join(dir, 'MEMORY.md'))
    if (d && m && d - m > SYNC_LAG_MIN * 60e3 && now - d < RECENT_HOURS * 3600e3) {
      behind.push(`${entry.name}: DECISIONS.md is ${Math.round((d - m) / 60e3)} min ahead of MEMORY.md`)
    }
  }

  const tasks: MementoTask[] = []
  for (const row of activeRows(ws.index).slice(0, 30)) {
    const memoryPath = join(join(ws.dir, row.name), 'MEMORY.md')
    const updated = await mtime($, memoryPath)
    tasks.push({
      ...row,
      next: nextLine(await readText($, memoryPath)),
      updatedMs: updated || null,
    })
  }

  let unverified = 0
  try {
    const insights = (await $.fs.list(join(ws.dir, 'Insights'))).filter(
      x => x.kind === 'file' && x.name.endsWith('.md'),
    )
    for (const file of insights.slice(0, 300)) {
      const text = await readText($, join(join(ws.dir, 'Insights'), file.name))
      if (text && /^status:\s*(hypothesis|interpretation)\b/m.test(text)) unverified += 1
    }
  } catch {
    unverified = 0
  }

  let backups = 0
  try {
    backups = (await $.fs.list(join(join(ws.dir, '.memento'), 'backups'))).filter(x =>
      /^\d{8}-\d{6}$/.test(x.name),
    ).length
  } catch {
    backups = 0
  }

  return {
    workspace: ws.dir,
    mode: /^mode:\s*core\s*$/m.test(ws.index) ? 'core' : 'full',
    guardsOff: /^guards:\s*off\s*$/m.test(ws.index),
    backups,
    behind,
    checkpoint: checkpointOf(await readText($, join(ws.dir, 'CHECKPOINT.yml'))),
    tasks,
    unverified,
    checkedAt: now,
  }
}

function ago(ms: number | null, now: number): string {
  if (!ms) return 'no log yet'
  const min = Math.max(0, Math.round((now - ms) / 60e3))
  if (min < 60) return `${min} min ago`
  const h = Math.round(min / 60)
  if (h < 48) return `${h} h ago`
  return `${Math.round(h / 24)} days ago`
}

function syncPrompt(behind: string[]): string {
  return `Sync the task memory now (Memento): ${behind.join('; ')}.`
}

// ------------------------------------------------------------------ hooks

// The session's folder; session.start sets it again after every reload.
let cwd = ''

async function refresh($: EngineInterface): Promise<void> {
  if (!cwd) return
  const now = await $.clock.now()
  const next = await compute($, cwd, now)
  await update($, status, () => next)
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    cwd = e.cwd
    await $.command.register({
      name: 'memento-panel',
      description: 'Show Memento task memory in a pane: active tasks, next steps, checkpoints, memory that fell behind',
    })
    await refresh($)
    if ((await read($, status)) !== null) void $.ui.open({ id: PANE, title: TITLE })

    return next(e)
  })

  on('command.run', { command: 'memento-panel' }, async $ => {
    await refresh($)
    const found = await read($, status)
    if (found === null) {
      return { text: 'No Memento workspace above this folder: run /memento-md:init <workspace> first.' }
    }
    await $.ui.open({ id: PANE, title: TITLE })

    return { text: 'Memento pane opened.' }
  })

  on('turn.complete', async ($, e, next) => {
    const done = await next(e)
    await refresh($)

    return done
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const s = await read($, status)
    if (e.props.hasSurvey || s === null || s.guardsOff || s.behind.length === 0) return next(e)
    if ((await read($, hidden)) === s.behind.join('|')) return next(e)

    const { Box, Button, Text } = $.ui.resolve(e)
    const more = s.behind.length > 1 ? ` (+${s.behind.length - 1} more)` : ''

    return (
      <Box>
        <Text color="warning">Memento: memory is behind - </Text>
        <Text>
          {s.behind[0]}
          {more}{' '}
        </Text>
        <Button
          key="sync"
          label="Sync now"
          variant="primary"
          onPress={() => void $.prompt.submit({ text: syncPrompt(s.behind) })}
        />
        <Button key="pane" label="Panel" onPress={() => void $.ui.open({ id: PANE, title: TITLE })} />
        <Button key="hide" label="Hide" onPress={() => update($, hidden, () => s.behind.join('|'))} />
      </Box>
    )
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Button, Text } = $.ui.resolve(e)
    const s = await read($, status)

    if (s === null) {
      return (
        <Box flexDirection="column">
          <Text dimColor>No Memento workspace above this folder.</Text>
          <Text dimColor>Run /memento-md:init &lt;workspace&gt; once.</Text>
        </Box>
      )
    }

    const now = s.checkedAt

    return (
      <Box flexDirection="column" gap={1}>
        <Box flexDirection="column">
          <Text bold>{baseName(s.workspace)}</Text>
          <Text dimColor>
            mode {s.mode} · guards {s.guardsOff ? 'off' : 'on'} · {s.backups} backups
          </Text>
        </Box>

        {s.behind.length > 0 && (
          <Box flexDirection="column">
            <Text color="warning" bold>
              Memory is behind
            </Text>
            {s.behind.map(reason => (
              <Text>- {reason}</Text>
            ))}
          </Box>
        )}

        {s.checkpoint !== null && (
          <Box flexDirection="column">
            <Text color="warning">Checkpoint active: {s.checkpoint.operation}</Text>
            {s.checkpoint.next !== null && <Text dimColor>next step: {s.checkpoint.next}</Text>}
          </Box>
        )}

        <Box flexDirection="column">
          <Text bold>Active tasks ({s.tasks.length})</Text>
          {s.tasks.length === 0 && <Text dimColor>None registered in INDEX.md.</Text>}
          {s.tasks.map(task => (
            <Box flexDirection="column">
              <Text>
                {task.glyph ? `${task.glyph} ` : ''}
                {task.name} <Text dimColor>· updated {ago(task.updatedMs, now)}</Text>
              </Text>
              {task.next !== null && <Text color="suggestion">  next: {task.next}</Text>}
            </Box>
          ))}
        </Box>

        {s.unverified > 0 && (
          <Text dimColor>
            {s.unverified} insight{s.unverified === 1 ? '' : 's'} not yet verified (hypothesis or
            interpretation)
          </Text>
        )}

        <Box gap={1}>
          <Button key="refresh" label="Refresh" onPress={() => void refresh($)} />
          {s.behind.length > 0 && (
            <Button
              key="sync-pane"
              label="Sync now"
              variant="primary"
              onPress={() => void $.prompt.submit({ text: syncPrompt(s.behind) })}
            />
          )}
        </Box>
      </Box>
    )
  })
}
