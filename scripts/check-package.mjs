import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";

const [{ files }] = JSON.parse(execFileSync("npm", ["pack", "--dry-run", "--json"], { encoding: "utf8" }));
const paths = files.map(({ path }) => path);
for (const required of ["LICENSE", "README.md", "CHANGELOG.md", "SECURITY.md", "index.ts", "package.json", "src/editor.ts", "src/index.ts"]) {
	assert(paths.includes(required), `Missing package file: ${required}`);
}
for (const path of paths) assert(!path.startsWith("test/"), `Tests must not ship: ${path}`);
console.log(`Validated ${paths.length} package files.`);
