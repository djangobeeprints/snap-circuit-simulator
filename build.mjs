// Builds the published index.html: encrypts src/app.html with the class password
// and drops the result into gate.html. The password is never written to disk.
//
//   node build.mjs                          (asks for the password)
//   SNAP_PASSWORD=... node build.mjs        (non-interactive)
import { readFileSync, writeFileSync } from 'node:fs';
import { webcrypto as crypto } from 'node:crypto';
import { createInterface } from 'node:readline/promises';

const ITERATIONS = 600000;

let password = process.env.SNAP_PASSWORD;
if (!password) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  password = await rl.question('Class password: ');
  rl.close();
}
password = password.trim().toUpperCase();   // the gate page is case-insensitive
if (!password) throw new Error('A password is required.');

const salt = crypto.getRandomValues(new Uint8Array(16));
const iv = crypto.getRandomValues(new Uint8Array(12));
const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
const key = await crypto.subtle.deriveKey(
  { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' },
  base, { name: 'AES-GCM', length: 256 }, false, ['encrypt']);
const data = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, readFileSync('src/app.html'));

const b64 = buf => Buffer.from(buf).toString('base64');
const payload = JSON.stringify({ salt: b64(salt), iv: b64(iv), iter: ITERATIONS, data: b64(data) });
const gate = readFileSync('gate.html', 'utf8');
if (!gate.includes('/*PAYLOAD*/null')) throw new Error('gate.html is missing the /*PAYLOAD*/null placeholder.');
writeFileSync('index.html', gate.replace('/*PAYLOAD*/null', payload));
console.log(`Wrote index.html (${(payload.length / 1024).toFixed(0)} KB encrypted payload).`);
