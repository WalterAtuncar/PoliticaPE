import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { resolve, dirname, join, sep } from 'path';
const SRC = resolve('src');
const exts = ['.tsx', '.ts', '/index.tsx', '/index.ts'];
const resolveImp = (from, spec) => {
  if (!spec.startsWith('.')) return null;
  const base = resolve(dirname(from), spec);
  for (const e of ['', ...exts]) {
    const p = base + e;
    if (existsSync(p) && statSync(p).isFile()) return p;
  }
  return null;
};
const seen = new Set();
const queue = [resolve('src/pages/MainApp.tsx'), resolve('src/App.tsx'), resolve('src/main.tsx'),
               resolve('src/pages/AuthPage.tsx'), resolve('src/pages/PrivacyPolicyPage.tsx'),
               resolve('src/pages/TermsOfServicePage.tsx')];
while (queue.length) {
  const f = queue.pop();
  if (!f || seen.has(f)) continue;
  seen.add(f);
  let txt;
  try { txt = readFileSync(f, 'utf8'); } catch { continue; }
  for (const m of txt.matchAll(/from\s+['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]/g)) {
    const r = resolveImp(f, m[1] || m[2]);
    if (r && !seen.has(r)) queue.push(r);
  }
}
const all = [];
const walk = d => readdirSync(d).forEach(n => {
  const p = join(d, n);
  if (statSync(p).isDirectory()) walk(p);
  else if (/\.(ts|tsx)$/.test(n)) all.push(p);
});
walk(SRC);
const dead = all.filter(f => !seen.has(f));
console.log(`alcanzables: ${seen.size} | total: ${all.length} | MUERTOS: ${dead.length}`);
console.log('');
const byDir = {};
for (const f of dead) {
  const rel = f.slice(SRC.length + 1).split(sep).join('/');
  const dir = rel.split('/').slice(0, -1).join('/');
  (byDir[dir] ||= []).push(rel.split('/').pop());
}
for (const [d, fs] of Object.entries(byDir).sort()) {
  console.log(`${d || '(raiz)'} [${fs.length}]: ${fs.join(', ')}`);
}
