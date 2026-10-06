import assert from "node:assert/strict";
import test from "node:test";
import { selectEditor, viewInEditor } from "../src/editor.ts";

test("selectEditor prefers VISUAL, then EDITOR, then platform default", () => {
	assert.equal(selectEditor({ VISUAL: "vim", EDITOR: "nano" }, "linux"), "vim");
	assert.equal(selectEditor({ EDITOR: "nano" }, "linux"), "nano");
	assert.equal(selectEditor({}, "win32"), "notepad");
	assert.equal(selectEditor({}, "linux"), "nano");
});

test("viewInEditor uses the default filesystem and process dependencies", async () => {
	await viewInEditor("prompt", "true");
	await assert.rejects(viewInEditor("prompt", ""), /Editor command is empty/);
	await assert.rejects(viewInEditor("prompt", "false"), /Editor exited with code 1/);
	await assert.rejects(viewInEditor("prompt", "missing-pi-prompt-editor"), /spawn missing-pi-prompt-editor ENOENT/);
});

test("viewInEditor writes the prompt, starts the editor, and removes its temporary directory", async () => {
	const calls: string[] = [];
	await viewInEditor("prompt", "editor", {
		createTempDirectory: async () => "/tmp/test-prompt",
		writePrompt: async (path, prompt) => { calls.push(`write:${path}:${prompt}`); },
		runEditor: async (editor, path) => { calls.push(`editor:${editor}:${path}`); },
		removeTempDirectory: async (path) => { calls.push(`remove:${path}`); },
	});
	assert.deepEqual(calls, [
		"write:/tmp/test-prompt/system-prompt.md:prompt",
		"editor:editor:/tmp/test-prompt/system-prompt.md",
		"remove:/tmp/test-prompt",
	]);
});

test("viewInEditor removes its temporary directory after an editor failure", async () => {
	let removed = "";
	await assert.rejects(() => viewInEditor("prompt", "editor", {
		createTempDirectory: async () => "/tmp/test-prompt",
		writePrompt: async () => undefined,
		runEditor: async () => { throw new Error("failed"); },
		removeTempDirectory: async (path) => { removed = path; },
	}));
	assert.equal(removed, "/tmp/test-prompt");
});

test("viewInEditor reports cleanup failure after a successful editor run", async () => {
	await assert.rejects(() => viewInEditor("prompt", "editor", {
		createTempDirectory: async () => "/tmp/test-prompt",
		writePrompt: async () => undefined,
		runEditor: async () => undefined,
		removeTempDirectory: async () => { throw new Error("cleanup failed"); },
	}), /cleanup failed/);
});
