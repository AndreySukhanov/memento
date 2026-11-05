#!/usr/bin/env node
// Memento guards: hooks that refuse to end a turn while task memory is behind,
// plus a rolling backup of the memory files. Plain Node, no dependencies.
//
//   node guards.js stop           Stop hook: back up, then check; may block the stop
//   node guards.js session-start  SessionStart hook: warn about a moved workspace
//   node guards.js selftest       Print what the guards see (used by /memento:check)
//
// Fail-open by design: any error inside a guard lets the turn end normally.
// A guard that breaks sessions would get uninstalled, and then nothing is guarded.
'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

const SYNC_LAG_MIN = 45;        // DECISIONS.md ahead of MEMORY.md by more than this -> block
const PROMISE_WINDOW_MIN = 5;   // a promise to write needs a memory file changed within this window
const OPEN_OP_HOURS = 12;       // unclosed OPS_LOG lines younger than this belong to the current session
const RECENT_HOURS = 12;        // older drift is the structure check's job, not a guard's
const BACKUP_KEEP = 20;
const TASK_FILES = ['CLAUDE.md', 'MEMORY.md', 'TASKS.md', 'DECISIONS.md', 'BRIEF.md'];
const WORKSPACE_FILES = ['INDEX.md', 'OPS_LOG.md', 'CHECKPOINT.yml'];
const WORKSPACE_DIRS = ['Insights', 'Observers', 'Consilium'];

// Narrow on purpose: "I'll save the file" or "внесу правку" are about code, not memory,
// and a guard that cries wolf gets switched off.
const PROMISE = [
  /\b(I'll|I will|I'm going to|I am going to|let me|going to)\s+(now\s+)?(record|log|sync|write (it|this|that) down|update (the )?(memory|log|index|decision)|save (it|this|that) (to|in|into) (memory|the log))\b/i,
  /(^|[^а-яё])(запишу|записываю|занесу в (память|журнал|лог)|сохраню в память|обновлю память|синхронизирую память)(?![а-яё])/i,
];
const DONE = [
  /\b(recorded|logged|synced|saved|written|wrote|noted)\b/i,
  /(записал|сохранил|занёс|занес|внёс|внес|обновил|синхронизировал)/i,
];

// ---------------------------------------------------------------- helpers

function readStdinJson() {
  try {
    const raw = fs.readFileSync(0, 'utf8');
    return raw.trim() ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function mtime(file) {
  try { return fs.statSync(file).mtimeMs; } catch { return 0; }
}

function isDir(p) {
  try { return fs.statSync(p).isDirectory(); } catch { return false; }
}

function walkFiles(dir, out = []) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walkFiles(p, out);
    else if (e.isFile()) out.push(p);
  }
  return out;
}

function stamp(d = new Date()) {
  const z = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${z(d.getMonth() + 1)}${z(d.getDate())}-${z(d.getHours())}${z(d.getMinutes())}${z(d.getSeconds())}`;
}

function minutes(ms) { return Math.round(ms / 60000); }

// The workspace is the nearest folder upwards holding a Memento INDEX.md.
function findWorkspace(start) {
  let dir = path.resolve(start || process.cwd());
  for (;;) {
    const idx = path.join(dir, 'INDEX.md');
    try {
      const text = fs.readFileSync(idx, 'utf8');
      if (/^# Task Index/m.test(text) || /^mode:\s*(core|full)\s*$/m.test(text)) {
        return { dir, index: text, off: /^guards:\s*off\s*$/m.test(text) };
      }
    } catch { /* not here */ }
    const up = path.dirname(dir);
    if (up === dir) return null;
    dir = up;
  }
}

function taskDirs(ws) {
  let entries;
  try { entries = fs.readdirSync(ws, { withFileTypes: true }); } catch { return []; }
  return entries
    .filter((e) => e.isDirectory() && !e.name.startsWith('.'))
    .map((e) => path.join(ws, e.name))
    .filter((d) => fs.existsSync(path.join(d, 'MEMORY.md')) && fs.existsSync(path.join(d, 'DECISIONS.md')));
}

// Claude Code keeps auto-memory under ~/.claude/projects/<project path with every
// non-alphanumeric character replaced by '-'>/memory. Best effort: the encoding is
// an implementation detail of Claude Code, so every use below tolerates a miss.
function encodeProjectPath(p) { return path.resolve(p).replace(/[^A-Za-z0-9]/g, '-'); }
function projectsRoot() { return path.join(os.homedir(), '.claude', 'projects'); }
function autoMemoryDir(projectDir) { return path.join(projectsRoot(), encodeProjectPath(projectDir), 'memory'); }

function memoryFiles(ws, projectDir) {
  const files = [];
  for (const f of WORKSPACE_FILES) if (fs.existsSync(path.join(ws, f))) files.push(path.join(ws, f));
  for (const d of WORKSPACE_DIRS) walkFiles(path.join(ws, d)).filter((f) => /\.(md|ya?ml)$/i.test(f)).forEach((f) => files.push(f));
  for (const t of taskDirs(ws)) for (const f of TASK_FILES) if (fs.existsSync(path.join(t, f))) files.push(path.join(t, f));
  const auto = autoMemoryDir(projectDir || ws);
  walkFiles(auto).filter((f) => f.endsWith('.md')).forEach((f) => files.push(f));
  return { files, auto };
}

// ---------------------------------------------------------------- guards

// 1. An operation opened in OPS_LOG.md and never closed: the write was cut short.
function openOperations(ws, now) {
  let text;
  try { text = fs.readFileSync(path.join(ws, 'OPS_LOG.md'), 'utf8'); } catch { return []; }
  const open = new Map();
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^-\s+(\d{4}-\d{2}-\d{2})\s+(\d{1,2}:\d{2})\s+([<>])\s+(.+)$/);
    if (!m) continue;
    const [, date, time, dir, rest] = m;
    if (dir === '>') {
      const key = rest.split(' -> ')[0].trim();
      open.set(key, { when: new Date(`${date}T${time.padStart(5, '0')}:00`).getTime(), line: line.trim() });
    } else {
      const key = rest.split(':')[0].trim();
      open.delete(key);
      if (key.startsWith('recovery ')) open.delete(key.slice('recovery '.length));
    }
  }
  return [...open.values()].filter((o) => o.when && now - o.when < OPEN_OP_HOURS * 3600e3 && o.when <= now + 60e3);
}

// 2. A decision recorded long ago with no log entry since: the sync never caught up.
function syncLag(ws, now) {
  const out = [];
  for (const t of taskDirs(ws)) {
    const d = mtime(path.join(t, 'DECISIONS.md'));
    const m = mtime(path.join(t, 'MEMORY.md'));
    if (d - m > SYNC_LAG_MIN * 60e3 && now - d < RECENT_HOURS * 3600e3) {
      out.push({ task: path.basename(t), ahead: minutes(d - m) });
    }
  }
  return out;
}

// 3. The final reply promises a write, and no memory file changed.
function lastReplyText(input) {
  if (typeof input.last_assistant_message === 'string') return input.last_assistant_message;
  const tp = input.transcript_path;
  if (!tp) return '';
  let raw;
  try {
    const size = fs.statSync(tp).size;
    const fd = fs.openSync(tp, 'r');
    const len = Math.min(size, 2 * 1024 * 1024);
    const buf = Buffer.alloc(len);
    fs.readSync(fd, buf, 0, len, size - len);
    fs.closeSync(fd);
    raw = buf.toString('utf8');
  } catch {
    return '';
  }
  const lines = raw.split('\n').filter(Boolean).reverse();
  const texts = [];
  for (const l of lines) {
    let e;
    try { e = JSON.parse(l); } catch { continue; }
    const content = e && e.message && e.message.content;
    if (e.type === 'user') break;                       // the turn started here
    if (e.type !== 'assistant' || !Array.isArray(content)) continue;
    if (content.some((c) => c.type === 'tool_use')) break; // text before tools was fulfilled by them
    for (const c of content.slice().reverse()) if (c.type === 'text' && c.text) texts.unshift(c.text);
  }
  return texts.join('\n');
}

function brokenPromise(input, files, now) {
  const text = lastReplyText(input);
  if (!text || !PROMISE.some((r) => r.test(text)) || DONE.some((r) => r.test(text))) return null;
  const newest = Math.max(0, ...files.map(mtime));
  if (now - newest < PROMISE_WINDOW_MIN * 60e3) return null;
  return { quiet: newest ? minutes(now - newest) : null };
}

// 4. Rolling backup of the memory files, taken only when something changed.
function backup(ws, files, auto) {
  const root = path.join(ws, '.memento', 'backups');
  const newest = Math.max(0, ...files.map(mtime));
  if (!newest) return null;
  fs.mkdirSync(root, { recursive: true });
  const gi = path.join(ws, '.memento', '.gitignore');
  if (!fs.existsSync(gi)) fs.writeFileSync(gi, '*\n');
  const snaps = fs.readdirSync(root).filter((n) => /^\d{8}-\d{6}$/.test(n)).sort();
  const last = snaps.length ? mtime(path.join(root, snaps[snaps.length - 1])) : 0;
  if (last >= newest) return null;
  const dest = path.join(root, stamp());
  for (const f of files) {
    const rel = f.startsWith(auto) ? path.join('_auto-memory', path.relative(auto, f)) : path.relative(ws, f);
    const target = path.join(dest, rel);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(f, target);
  }
  const all = fs.readdirSync(root).filter((n) => /^\d{8}-\d{6}$/.test(n)).sort();
  for (const old of all.slice(0, Math.max(0, all.length - BACKUP_KEEP))) {
    fs.rmSync(path.join(root, old), { recursive: true, force: true });
  }
  return dest;
}

// ---------------------------------------------------------------- commands

function onStop(input) {
  const ws = findWorkspace(input.cwd || process.env.CLAUDE_PROJECT_DIR);
  if (!ws || ws.off) return;
  const projectDir = process.env.CLAUDE_PROJECT_DIR || input.cwd || ws.dir;
  const now = Date.now();
  const { files, auto } = memoryFiles(ws.dir, projectDir);
  try { backup(ws.dir, files, auto); } catch { /* a failed backup must not block the turn */ }
  if (input.stop_hook_active) return; // already continued once for a guard: never loop

  const reasons = [];
  for (const o of openOperations(ws.dir, now)) {
    reasons.push(`OPS_LOG.md has an operation that was opened and never closed: "${o.line}". Finish it and write the closing "<" line, or close it with the reason it stopped.`);
  }
  for (const s of syncLag(ws.dir, now)) {
    reasons.push(`Task "${s.task}": DECISIONS.md is ${s.ahead} min ahead of MEMORY.md. Log the dated fact behind the decision (Rule 4) before ending the turn.`);
  }
  const p = brokenPromise(input, files, now);
  if (p) {
    reasons.push(`The reply promises a memory write, but no memory file changed in the last ${PROMISE_WINDOW_MIN} min${p.quiet !== null ? ` (last change ${p.quiet} min ago)` : ''}. Write it now, or say plainly that nothing was written.`);
  }
  if (reasons.length) {
    process.stdout.write(JSON.stringify({
      decision: 'block',
      reason: `Memento guards: memory is behind.\n- ${reasons.join('\n- ')}\n(Disable all guards with a "guards: off" line in INDEX.md.)`,
    }));
  }
}

// A moved workspace leaves its auto-memory under the old path. Speak up only when the
// evidence exists: no auto-memory here, but a same-named folder elsewhere has one.
function onSessionStart(input) {
  const ws = findWorkspace(input.cwd || process.env.CLAUDE_PROJECT_DIR);
  if (!ws || ws.off) return;
  const projectDir = process.env.CLAUDE_PROJECT_DIR || input.cwd || ws.dir;
  const here = autoMemoryDir(projectDir);
  if (fs.existsSync(path.join(here, 'MEMORY.md'))) return;
  const tail = '-' + path.basename(path.resolve(projectDir)).replace(/[^A-Za-z0-9]/g, '-');
  let candidates = [];
  try {
    candidates = fs.readdirSync(projectsRoot())
      .filter((n) => n.endsWith(tail) && n !== encodeProjectPath(projectDir))
      .map((n) => path.join(projectsRoot(), n, 'memory'))
      .filter((d) => fs.existsSync(path.join(d, 'MEMORY.md')));
  } catch { return; }
  if (!candidates.length) return;
  process.stdout.write(
    `Memento: this workspace has no auto-memory at ${here}, but a folder with the same name has one at ${candidates.join(', ')}. ` +
    'If the workspace was moved or renamed, its auto-memory stayed under the old path - tell the user and follow "Moving a workspace" in the task-memory skill before writing new auto-memory.\n'
  );
}

function selftest() {
  const cwd = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const ws = findWorkspace(cwd);
  const now = Date.now();
  if (!ws) { console.log(`guards: no Memento workspace found from ${cwd} - nothing to guard`); return; }
  const { files, auto } = memoryFiles(ws.dir, cwd);
  const snaps = (() => { try { return fs.readdirSync(path.join(ws.dir, '.memento', 'backups')).length; } catch { return 0; } })();
  console.log(`workspace:      ${ws.dir}`);
  console.log(`guards:         ${ws.off ? 'OFF (guards: off in INDEX.md)' : 'on'}`);
  console.log(`task folders:   ${taskDirs(ws.dir).length}`);
  console.log(`memory files:   ${files.length}`);
  console.log(`auto-memory:    ${fs.existsSync(path.join(auto, 'MEMORY.md')) ? auto : `not found at ${auto}`}`);
  console.log(`open ops:       ${openOperations(ws.dir, now).map((o) => o.line).join(' | ') || 'none'}`);
  console.log(`sync lag:       ${syncLag(ws.dir, now).map((s) => `${s.task} +${s.ahead}m`).join(', ') || 'none'}`);
  console.log(`backups:        ${snaps} of ${BACKUP_KEEP}`);
}

try {
  const cmd = process.argv[2];
  if (cmd === 'stop') onStop(readStdinJson());
  else if (cmd === 'session-start') onSessionStart(readStdinJson());
  else if (cmd === 'selftest') selftest();
} catch {
  // fail open
}
process.exit(0);
