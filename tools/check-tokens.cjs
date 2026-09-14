#!/usr/bin/env node
/**
 * Guarda de deriva entre tokens.ts (autoria) i tokens.css (custom properties).
 * Compara NOMS, no valors: la deriva perillosa és que un fitxer tingui un
 * token que l'altre no (T3.2, analysis.md §3.1/§3.9).
 *
 * ponytail: transformació camelCase->kebab per prefix de secció, mantinguda
 * a mà en comptes de codegen (A2, ~60 tokens, equip petit). Si tokens.ts
 * guanya seccions noves, cal afegir-les a SECTIONS.
 */
const fs = require('fs');
const path = require('path');

const tsPath = path.resolve(__dirname, '../src/styles/tokens.ts');
const cssPath = path.resolve(__dirname, '../src/styles/tokens.css');

const SECTIONS = [
  { name: 'primitives', prefix: null },
  { name: 'semantic', prefix: null },
  { name: 'space', prefix: 'space' },
  { name: 'spaceAlias', prefix: 'space' },
  { name: 'radius', prefix: 'radius' },
  { name: 'shadow', prefix: 'shadow' },
  { name: 'container', prefix: 'container' },
  { name: 'motion', prefix: null },
  { name: 'font', prefix: 'font' },
  { name: 'textScale', prefix: 'text' },
  { name: 'breakpoint', prefix: 'breakpoint' },
];

const kebab = (key) =>
  key
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([a-zA-Z])(\d)/g, '$1-$2')
    .toLowerCase();

function tsTokenNames(src) {
  const names = new Set();
  for (const { name, prefix } of SECTIONS) {
    const block = src.match(new RegExp(`export const ${name} = \\{([\\s\\S]*?)\\n\\} as const;`));
    if (!block) {
      console.error(`tokens.ts: no s'ha trobat la secció "${name}"`);
      process.exit(1);
    }
    const keyRe = /^\s*([A-Za-z0-9_]+):/gm;
    let m;
    while ((m = keyRe.exec(block[1]))) {
      const varName = prefix ? `lt-${prefix}-${kebab(m[1])}` : `lt-${kebab(m[1])}`;
      names.add(varName);
    }
  }
  return names;
}

function cssTokenNames(src) {
  const names = new Set();
  const re = /--(lt-[a-z0-9-]+)\s*:/g;
  let m;
  while ((m = re.exec(src))) names.add(m[1]);
  return names;
}

const tsNames = tsTokenNames(fs.readFileSync(tsPath, 'utf8'));
const cssNames = cssTokenNames(fs.readFileSync(cssPath, 'utf8'));

const onlyInTs = [...tsNames].filter((n) => !cssNames.has(n)).sort();
const onlyInCss = [...cssNames].filter((n) => !tsNames.has(n)).sort();

if (onlyInTs.length || onlyInCss.length) {
  if (onlyInTs.length) {
    console.error(`Tokens a tokens.ts sense --${onlyInTs[0]} equivalent a tokens.css:`);
    onlyInTs.forEach((n) => console.error(`  --${n}`));
  }
  if (onlyInCss.length) {
    console.error(`Tokens a tokens.css sense equivalent a tokens.ts:`);
    onlyInCss.forEach((n) => console.error(`  --${n}`));
  }
  process.exit(1);
}

console.log(`check-tokens: OK (${tsNames.size} tokens coincideixen)`);
