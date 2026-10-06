import assert from "node:assert/strict";
import test from "node:test";
import { selectEditor, viewInEditor } from "../src/editor.ts";

test("selectEditor prefers VISUAL, then EDITOR, then platform default", () => {
	assert.equal(selectEditor({ VISUAL: "vim", EDITOR: "nano" }, "linux"), "vim");
	assert.equal(selectEditor({ EDITOR: "nano" }, "linux"), "nano");
	assert.equal(selectEditor({}, "win32"), "notepad");
	assert.equal(selectEditor({}, "linux"), "nano");
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
