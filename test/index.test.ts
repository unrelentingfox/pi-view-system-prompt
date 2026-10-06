import assert from "node:assert/strict";
import test from "node:test";
import { openEditor, registerViewSystemPrompt } from "../src/index.ts";

test("command uses the latest observed prompt", async () => {
	let hook: ((event: { systemPrompt?: string }) => void) | undefined;
	let handler: ((args: string, ctx: any) => Promise<void>) | undefined;
	const seen: string[] = [];
	registerViewSystemPrompt({
		on: (_name: string, callback: any) => { hook = callback; },
		registerCommand: (_name: string, command: any) => { handler = command.handler; },
	} as any, { view: async (prompt) => { seen.push(prompt); } });
	await handler!("", { getSystemPrompt: () => "fallback" });
	hook!({ systemPrompt: "observed" });
	await handler!("", { getSystemPrompt: () => "fallback" });
	assert.deepEqual(seen, ["fallback", "observed"]);
});

test("command warns outside TUI mode", async () => {
	let handler: any;
	const notifications: string[] = [];
	const api: any = { on() {}, registerCommand(_name: string, command: any) { handler = command.handler; } };
	registerViewSystemPrompt(api);
	const context = {
		mode: "print",
		getSystemPrompt: () => "prompt",
		ui: { notify: (message: string) => notifications.push(message) },
	};
	await handler("", context);
	assert.deepEqual(notifications, ["System-prompt viewer requires TUI mode"]);
});

test("openEditor restores the TUI after success", async () => {
	const calls: string[] = [];
	let viewed = "";
	await openEditor(
		{
			stop: () => calls.push("stop"),
			start: () => calls.push("start"),
			requestRender: (full) => calls.push(`render:${String(full)}`),
		},
		"prompt",
		{ ui: { notify() {} } } as any,
		() => calls.push("done"),
		async (prompt) => { viewed = prompt; },
	);
	assert.equal(viewed, "prompt");
	assert.deepEqual(calls, ["stop", "start", "render:true", "done"]);
});

test("openEditor restores the TUI after failure", async () => {
	const calls: string[] = [];
	const notifications: Array<{ message: string; type: string }> = [];
	await openEditor(
		{
			stop: () => calls.push("stop"),
			start: () => calls.push("start"),
			requestRender: (full) => calls.push(`render:${String(full)}`),
		},
		"prompt",
		{ ui: { notify: (message: string, type: string) => notifications.push({ message, type }) } } as any,
		() => calls.push("done"),
		async () => { throw new Error("failed"); },
	);
	assert.deepEqual(calls, ["stop", "start", "render:true", "done"]);
	assert.deepEqual(notifications, [{ message: "Could not open editor: failed", type: "warning" }]);
});
