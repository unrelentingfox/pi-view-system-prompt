import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  conventionalTypes,
  validateCommitMessage,
} from "../scripts/validate-commit-message.mjs";

const validSubjects = [
  ...conventionalTypes.map((type) => `${type}: supported type`),
  "feat(config): support comments",
  "feat!: remove legacy settings",
  "refactor(config)!: change the schema",
  "Merge branch 'feature'",
  "Merge pull request #12 from example/branch",
  "Merge remote-tracking branch 'origin/main'",
  "Revert \"feat: remove legacy settings\"",
  "fixup! fix: preserve prompt capture",
];

for (const subject of validSubjects) {
  test(`accepts ${subject}`, () => {
    assert.equal(validateCommitMessage(`${subject}\n`), undefined);
  });
}

test("accepts a breaking change footer", () => {
  const message = [
    "feat: replace legacy settings",
    "",
    "BREAKING CHANGE: callers must use the new command.",
  ].join("\n");

  assert.equal(validateCommitMessage(message), undefined);
});

test("ignores Git comment lines", () => {
  const message = "# generated comment\nfix: preserve prompt capture\n";

  assert.equal(validateCommitMessage(message), undefined);
});

test("keeps workflow types aligned with the local validator", async () => {
  const workflow = await readFile(
    new URL("../.github/workflows/pr-title.yml", import.meta.url),
    "utf8",
  );
  const configuredTypes = workflow
    .match(/          types: \|\n((?:            \w[\w-]*\n)+)/)?.[1]
    .trim()
    .split(/\s+/);

  assert.deepEqual(configuredTypes, conventionalTypes);
});

const invalidMessages = [
  ["empty message", ""],
  ["missing type", "preserve prompt capture"],
  ["missing description", "fix:"],
  ["missing separator", "fix preserve prompt capture"],
  ["uppercase type", "Fix: preserve prompt capture"],
  ["unsupported type", "feet: preserve prompt capture"],
  ["broad merge prefix", "Merge anything at all"],
  ["broad revert prefix", "Revert anything at all"],
  ["empty scope", "fix(): preserve prompt capture"],
];

for (const [name, message] of invalidMessages) {
  test(`rejects ${name}`, () => {
    assert.match(validateCommitMessage(message), /subject|message/);
  });
}
