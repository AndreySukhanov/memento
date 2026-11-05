import { expect, test } from 'claude-code/testing'

const NOW = new Date(2026, 10, 6, 10, 0).getTime()
const MIN = 60e3

const FILES: Record<string, string> = {
  '/ws/INDEX.md': [
    '# Task Index',
    '',
    'mode: full',
    '',
    '## Active',
    '',
    '| Task | Essence | Status | Key artifacts |',
    '|---|---|---|---|',
    '| [>] [task-a](task-a/) | checkout bug | fix written (2026-11-05) | - |',
    '',
    '## Completed',
    '',
  ].join('\n'),
  '/ws/OPS_LOG.md': '- 2026-11-06 09:00 > sync task-a -> MEMORY.md, DECISIONS.md\n',
  '/ws/task-a/MEMORY.md': '## CURRENT PHASE (2026-11-06)\nnext: ask Jane whether 21.08 clears the freeze\n',
  '/ws/task-a/DECISIONS.md': '## D1 - retry cap\n',
  '/ws/CHECKPOINT.yml': 'operation: locale bulk edit\nstatus: active\nsteps:\n  - ru  # done\n  - en  # <- next\n',
  '/ws/Insights/2026-11-01-freeze.md': '---\nstatus: hypothesis\n---\n',
}
const MTIME: Record<string, number> = {
  '/ws/task-a/MEMORY.md': NOW - 70 * MIN,
  '/ws/task-a/DECISIONS.md': NOW - 10 * MIN,
}
const DIRS: Record<string, { name: string; kind: 'file' | 'dir' }[]> = {
  '/ws': [
    { name: 'task-a', kind: 'dir' },
    { name: 'Insights', kind: 'dir' },
    { name: 'INDEX.md', kind: 'file' },
  ],
  '/ws/Insights': [{ name: '2026-11-01-freeze.md', kind: 'file' }],
}

// The engine hands paths over as this machine spells them (C:\ws\... on Windows).
const norm = (p: string) => p.replace(/^[A-Za-z]:/, '').split('\\').join('/')

function engine(on: any, files: Record<string, string>) {
  on('command.register', () => ({ value: { command: 'memento-panel' } }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('session.start', (_: unknown, e: { cwd: string }) => ({ cwd: e.cwd }))
  on('clock.now', () => ({ value: NOW }))
  on('fs.read', (_: unknown, e: { path: string }) =>
    norm(e.path) in files ? { value: files[norm(e.path)] } : { deny: 'ENOENT' },
  )
  on('fs.stat', (_: unknown, e: { path: string }) =>
    norm(e.path) in files
      ? { value: { kind: 'file', size: 1, mtimeMs: MTIME[norm(e.path)] ?? NOW - 5 * MIN, isLink: false } }
      : { deny: 'ENOENT' },
  )
  on('fs.list', (_: unknown, e: { path: string }) =>
    norm(e.path) in DIRS
      ? { value: DIRS[norm(e.path)].map(x => ({ ...x, size: 0, mtimeMs: 0, isLink: false })) }
      : { deny: 'ENOENT' },
  )
}

const BAND = {
  plugin: 'memento-panel',
  component: 'AbovePrompt',
  requestId: 'band',
  props: { hasSurvey: false, isWorking: false, maxRows: 3, bodyColumns: 100, scroll: { offset: 0, bodyRows: 3 } },
} as const

const PANE = {
  plugin: 'memento-panel',
  component: 'Pane',
  requestId: 'memento',
  props: {
    title: 'Memento',
    isFocused: false,
    bodyColumns: 60,
    placement: 'dock',
    scroll: { offset: 0, bodyRows: 40 },
    view: {},
  },
} as const

test('the band says memory is behind, on every surface', async ($, on) => {
  engine(on, FILES)
  await $.session.start({ cwd: '/ws/task-a', surface: 'desktop', isInteractive: true })

  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ ...BAND, surface })
    expect((await ui.find({ type: 'Text', text: /memory is behind/ }))?.text).toContain('memory is behind')
    expect((await ui.find({ type: 'Text', text: /operation left open/ }))?.text).toContain('sync task-a')
    expect(await ui.find({ type: 'Button', key: 'sync' })).toBeTruthy()
    await ui.unmount()
  }
})

test('the pane lists the task, its next step, the checkpoint and the lag', async ($, on) => {
  engine(on, FILES)
  await $.session.start({ cwd: '/ws/task-a', surface: 'desktop', isInteractive: true })

  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ ...PANE, surface })
    expect((await ui.find({ type: 'Text', text: /next: ask Jane/ }))?.text).toContain('21.08')
    expect((await ui.find({ type: 'Text', text: /Checkpoint active/ }))?.text).toContain('locale bulk edit')
    expect((await ui.find({ type: 'Text', text: /60 min ahead/ }))?.text).toContain('task-a')
    expect((await ui.find({ type: 'Text', text: /not yet verified/ }))?.text).toContain('1 insight')
    await ui.unmount()
  }
})

test('outside a workspace the pane says how to start', async ($, on) => {
  engine(on, {})
  await $.session.start({ cwd: '/elsewhere', surface: 'desktop', isInteractive: true })

  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  expect((await ui.find({ type: 'Text', text: /No Memento workspace/ }))?.text).toBeTruthy()
  await ui.unmount()
})
