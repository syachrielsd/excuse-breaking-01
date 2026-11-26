// excuse-breaking-01 — The One-Line AI Excuse for Breaking Production.
// Writes the screened winning line to /output/entry.txt and nothing else.
// The line is embedded in this file, so no source is ever resolved from
// process.cwd(); the only filesystem touch is the output write. No rendering,
// no network, no randomness: the output is the same on every run.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const LINE: string =
  "I saw the error rate hit 100%, so I deleted the error logs. Error rate is now zero.";

function fail(message: string): never {
  console.error(`FATAL: ${message}`);
  process.exit(1);
}

// Gate (mirrors the sealed scorer): UTF-8 text, 1-180 characters, not
// whitespace-only, exactly one line, no trailing newline in the file.
if (LINE.length < 1 || LINE.length > 180) {
  fail(`line is ${LINE.length} characters, outside the 1-180 gate`);
}
if (LINE.trim().length === 0) {
  fail("line is whitespace-only");
}
if (/[\r\n]/.test(LINE)) {
  fail("line must be a single line with no newline characters");
}

const outDir: string = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
const outPath: string = join(outDir, "entry.txt");
writeFileSync(outPath, LINE, "utf8");

// Read-back self-check: the file on disk must be byte-identical to the
// gated line. If the write was truncated, re-encoded, or gained a trailing
// newline, fail loudly instead of shipping a bad entry.
const written: string = readFileSync(outPath, "utf8");
if (written !== LINE) {
  fail(`read-back mismatch: file is ${written.length} chars, expected ${LINE.length}`);
}
if (written.length < 1 || written.length > 180 || written.trim().length === 0) {
  fail("read-back failed the 1-180 / non-blank gate");
}
console.log(`wrote ${LINE.length} chars to ${outPath} (read-back verified)`);
