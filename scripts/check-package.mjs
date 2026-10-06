import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";

const [manifest] = JSON.parse(execFileSync("npm", ["pack", "--dry-run", "--json"], { encoding: "utf8" }));
const paths = manifest.files.map(({ path }) => path).sort();
const expectedPaths = [
	"CHANGELOG.md",
	"LICENSE",
	"README.md",
	"RELEASING.md",
	"SECURITY.md",
	"index.ts",
	"package.json",
	"src/editor.ts",
	"src/index.ts",
].sort();

assert.deepEqual(paths, expectedPaths, "Package payload changed");
console.log(`Package payload verified: ${paths.length} files`);
