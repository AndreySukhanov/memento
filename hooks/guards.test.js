// Offline tests for hooks/guards.js. Run: node hooks/guards.test.js
// Each case builds a throwaway workspace in the OS temp dir and feeds the hook its stdin.
'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const GUARDS = path.join(__dirname, 'guards.js');
const INDEX = '# Task Index\n\nmode: full\n\n## Active\n';
const MIN = 60e3;
let passed = 0;

function workspace({ index = INDEX } = {}) {
  const ws = fs.mkdtempSync(path.join(os.tmpdir(), 'memento-ws-'));
  fs.writeFileSync(path.join(ws, 'INDEX.md'), index);
  const task = path.join(ws, 'checkout-bug');
  fs.mkdirSync(task);
  for (const f of ['CLAUDE.md', 'MEMORY.md', 'TASKS.md', 'DECISIONS.md', 'BRIEF.md']) {
    fs.writeFileSync(path.join(task, f), `# ${f}\n`);
  }
  return { ws, task };
}

function age(file, minutesAgo) {
  const t = new Date(Date.now() - minutesAgo * MIN);
  fs.utimesSync(file, t, t);
}

function ageAll(ws, minutesAgo) {
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).forEach((e) => {
    const p = path.join(d, e.name);
    if (e.isDirectory()) { if (e.name !== '.memento') walk(p); } else age(p, minutesAgo);
  });
  walk(ws);
}

function opsLine(minutesAgo, dir, text) {
  const d = new Date(Date.now() - minutesAgo * MIN);
  const z = (n) => String(n).padStart(2, '0');
  return `- ${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())} ${z(d.getHours())}:${z(d.getMinutes())} ${dir} ${text}\n`;
}

function run(cmd, input, env = {}) {
  const r = spawnSync(process.execPath, [GUARDS, cmd], {
    input: typeof input === 'string' ? input : JSON.stringify(input),
    encoding: 'utf8',
    env: { ...process.env, CLAUDE_PROJECT_DIR: '', ...env },
  });
  assert.strictEqual(r.status, 0, `guards.js must always exit 0, got ${r.status}: ${r.stderr}`);
  return r.stdout.trim() ? (cmd === 'stop' ? JSON.parse(r.stdout) : r.stdout) : null;
}

function test(name, fn) {
  fn();
  passed += 1;
  console.log(`ok - ${name}`);
}

test('quiet workspace: no block', () => {
  const { ws } = workspace();
  ageAll(ws, 30);
  assert.strictEqual(run('stop', { cwd: ws, last_assistant_message: 'Done, nothing to record.' }), null);
});

test('operation opened in OPS_LOG.md and never closed: block', () => {
  const { ws } = workspace();
  fs.writeFileSync(path.join(ws, 'OPS_LOG.md'), opsLine(10, '>', 'sync checkout-bug -> MEMORY.md, DECISIONS.md'));
  ageAll(ws, 10);
  const out = run('stop', { cwd: ws });
  assert.strictEqual(out.decision, 'block');
  assert.match(out.reason, /opened and never closed/);
});

test('closed and recovered operations do not block', () => {
  const { ws } = workspace();
  fs.writeFileSync(path.join(ws, 'OPS_LOG.md'),
    opsLine(50, '>', 'sync checkout-bug -> MEMORY.md') + opsLine(49, '<', 'sync checkout-bug: +1 fact') +
    opsLine(40, '>', 'seal checkout-bug -> MEMORY.md') + opsLine(20, '<', 'recovery seal checkout-bug: checked MEMORY.md'));
  ageAll(ws, 20);
  assert.strictEqual(run('stop', { cwd: ws }), null);
});

test('an unclosed operation from days ago is the structure check\'s job, not a guard\'s', () => {
  const { ws } = workspace();
  fs.writeFileSync(path.join(ws, 'OPS_LOG.md'), opsLine(3 * 24 * 60, '>', 'sync checkout-bug -> MEMORY.md'));
  ageAll(ws, 30);
  assert.strictEqual(run('stop', { cwd: ws }), null);
});

test('DECISIONS.md far ahead of MEMORY.md: block', () => {
  const { ws, task } = workspace();
  ageAll(ws, 120);
  age(path.join(task, 'DECISIONS.md'), 5);
  const out = run('stop', { cwd: ws });
  assert.strictEqual(out.decision, 'block');
  assert.match(out.reason, /checkout-bug.*ahead of MEMORY\.md/);
});

test('DECISIONS.md a few minutes ahead (normal sync order): no block', () => {
  const { ws, task } = workspace();
  ageAll(ws, 20);
  age(path.join(task, 'DECISIONS.md'), 15);
  assert.strictEqual(run('stop', { cwd: ws }), null);
});

test('promise to write with no memory change: block (English)', () => {
  const { ws } = workspace();
  ageAll(ws, 30);
  const out = run('stop', { cwd: ws, last_assistant_message: "Good catch - I'll record this in the task log." });
  assert.strictEqual(out.decision, 'block');
  assert.match(out.reason, /promises a memory write/);
});

test('promise to write with no memory change: block (Russian)', () => {
  const { ws } = workspace();
  ageAll(ws, 30);
  const out = run('stop', { cwd: ws, last_assistant_message: 'Понял, запишу это в память.' });
  assert.strictEqual(out.decision, 'block');
});

test('promise kept - a memory file just changed: no block', () => {
  const { ws, task } = workspace();
  ageAll(ws, 30);
  age(path.join(task, 'MEMORY.md'), 1);
  assert.strictEqual(run('stop', { cwd: ws, last_assistant_message: "I'll record the follow-up next." }), null);
});

test('talk about code is not a memory promise: no block', () => {
  const { ws } = workspace();
  ageAll(ws, 30);
  for (const msg of ["I'll save the file and rerun the tests.", 'Let me note that the API is slow.', 'Сейчас внесу правку в код и сохраню файл.']) {
    assert.strictEqual(run('stop', { cwd: ws, last_assistant_message: msg }), null, msg);
  }
});

test('reply reports a completed write: no block', () => {
  const { ws } = workspace();
  ageAll(ws, 30);
  assert.strictEqual(run('stop', { cwd: ws, last_assistant_message: 'Recorded in MEMORY.md; I will log the rest at the sync.' }), null);
});

test('transcript fallback finds the final reply text', () => {
  const { ws } = workspace();
  ageAll(ws, 30);
  const tr = path.join(ws, 'transcript.jsonl');
  const lines = [
    { type: 'user', message: { role: 'user', content: 'what now?' } },
    { type: 'assistant', message: { content: [{ type: 'tool_use', name: 'Read', input: {} }] } },
    { type: 'user', message: { content: [{ type: 'tool_result', content: 'x' }] } },
    { type: 'assistant', message: { content: [{ type: 'text', text: "I'll log the decision later." }] } },
  ];
  fs.writeFileSync(tr, lines.map((l) => JSON.stringify(l)).join('\n') + '\n');
  age(tr, 30);
  const out = run('stop', { cwd: ws, transcript_path: tr });
  assert.strictEqual(out.decision, 'block');
});

test('stop_hook_active: never block twice in a row', () => {
  const { ws, task } = workspace();
  ageAll(ws, 120);
  age(path.join(task, 'DECISIONS.md'), 5);
  assert.strictEqual(run('stop', { cwd: ws, stop_hook_active: true }), null);
});

test('guards: off in INDEX.md silences everything', () => {
  const { ws, task } = workspace({ index: INDEX + '\nguards: off\n' });
  ageAll(ws, 120);
  age(path.join(task, 'DECISIONS.md'), 5);
  assert.strictEqual(run('stop', { cwd: ws }), null);
  assert.ok(!fs.existsSync(path.join(ws, '.memento')));
});

test('outside a Memento workspace: nothing happens', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'not-memento-'));
  assert.strictEqual(run('stop', { cwd: dir, last_assistant_message: "I'll record it." }), null);
});

test('garbage on stdin: exit 0, no output', () => {
  assert.strictEqual(run('stop', 'not json at all'), null);
});

test('backup: one snapshot per change, gitignored, ring of 20', () => {
  const { ws, task } = workspace();
  ageAll(ws, 30);
  run('stop', { cwd: ws });
  const root = path.join(ws, '.memento', 'backups');
  const first = fs.readdirSync(root);
  assert.strictEqual(first.length, 1);
  assert.ok(fs.existsSync(path.join(root, first[0], 'checkout-bug', 'MEMORY.md')));
  assert.strictEqual(fs.readFileSync(path.join(ws, '.memento', '.gitignore'), 'utf8'), '*\n');
  run('stop', { cwd: ws });
  assert.strictEqual(fs.readdirSync(root).length, 1, 'no change, no new snapshot');
  for (let i = 0; i < 25; i += 1) fs.mkdirSync(path.join(root, `2026010${i % 10}-0000${String(i).padStart(2, '0')}`), { recursive: true });
  for (const d of fs.readdirSync(root)) age(path.join(root, d), 60);
  fs.writeFileSync(path.join(task, 'MEMORY.md'), '# MEMORY.md\n- new fact\n');
  run('stop', { cwd: ws });
  assert.strictEqual(fs.readdirSync(root).length, 20);
});

test('session start: warns when a same-named workspace elsewhere holds the auto-memory', () => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'memento-home-'));
  const parent = fs.mkdtempSync(path.join(os.tmpdir(), 'memento-moved-'));
  const ws = path.join(parent, 'acme-work');
  fs.mkdirSync(ws);
  fs.writeFileSync(path.join(ws, 'INDEX.md'), INDEX);
  const old = path.join(home, '.claude', 'projects', 'C--old-place-acme-work', 'memory');
  fs.mkdirSync(old, { recursive: true });
  fs.writeFileSync(path.join(old, 'MEMORY.md'), '- [Rule](feedback_x.md)\n');
  const env = { USERPROFILE: home, HOME: home };
  const out = run('session-start', { cwd: ws, source: 'startup' }, env);
  assert.match(out, /moved or renamed/);
  const here = path.join(home, '.claude', 'projects', path.resolve(ws).replace(/[^A-Za-z0-9]/g, '-'), 'memory');
  fs.mkdirSync(here, { recursive: true });
  fs.writeFileSync(path.join(here, 'MEMORY.md'), '- [Rule](feedback_x.md)\n');
  assert.strictEqual(run('session-start', { cwd: ws, source: 'startup' }, env), null, 'own auto-memory found: silent');
});

console.log(`\n${passed} passed`);
