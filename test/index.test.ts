import assert from "node:assert/strict";
import test from "node:test";
import viewSystemPrompt from "../index.ts";
import { createPromptViewer, openEditor, registerViewSystemPrompt } from "../src/index.ts";

test("default extension registers the prompt viewer", () => {
	let commandName = "";
	viewSystemPrompt({
		on() {},
		registerCommand(name: string) { commandName = name; },
	} as any);
	assert.equal(commandName, "view-system-prompt");
});

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

test("prompt viewer completes the TUI lifecycle after a successful editor view", async () => {
	const calls: string[] = [];
	let component: { render(): unknown[]; invalidate(): void } | undefined;
	const viewer = createPromptViewer(async (prompt) => { calls.push(`view:${prompt}`); });
	await viewer.view("prompt", {
		mode: "tui",
		ui: {
			notify() {},
			custom: (factory: any) => new Promise<void>((resolve) => {
				component = factory(
					{
						stop: () => calls.push("stop"),
						start: () => calls.push("start"),
						requestRender: (full: boolean | undefined) => calls.push(`render:${String(full)}`),
					},
					{},
					{},
					() => { calls.push("done"); resolve(); },
				);
			}),
		},
	} as any);
	assert.deepEqual(component?.render(), []);
	component?.invalidate();
	assert.deepEqual(calls, ["stop", "view:prompt", "start", "render:true", "done"]);
});

test("prompt viewer restores the TUI and warns after an editor view failure", async () => {
	const calls: string[] = [];
	const notifications: Array<{ message: string; type: string }> = [];
	const viewer = createPromptViewer(async () => { throw new Error("failed"); });
	await viewer.view("prompt", {
		mode: "tui",
		ui: {
			notify: (message: string, type: string) => notifications.push({ message, type }),
			custom: (factory: any) => new Promise<void>((resolve) => {
				factory(
					{
						stop: () => calls.push("stop"),
						start: () => calls.push("start"),
						requestRender: (full: boolean | undefined) => calls.push(`render:${String(full)}`),
					},
					{}, {}, () => { calls.push("done"); resolve(); },
				);
			}),
		},
	} as any);
	assert.deepEqual(calls, ["stop", "start", "render:true", "done"]);
	assert.deepEqual(notifications, [{ message: "Could not open editor: failed", type: "warning" }]);
});

test("prompt viewer warns outside TUI mode", async () => {
	const notifications: string[] = [];
	await createPromptViewer(async () => undefined).view("prompt", {
		mode: "print",
		ui: { notify: (message: string) => notifications.push(message) },
	} as any);
	assert.deepEqual(notifications, ["System-prompt viewer requires TUI mode"]);
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
