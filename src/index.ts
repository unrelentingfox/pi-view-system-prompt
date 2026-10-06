import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { selectEditor, viewInEditor } from "./editor.ts";

export interface PromptViewer {
	view(prompt: string, ctx: ExtensionContext): Promise<void>;
}

type ViewPrompt = (prompt: string) => Promise<void>;

export function createPromptViewer(viewPrompt: ViewPrompt): PromptViewer {
	return {
		async view(prompt, ctx) {
			if (ctx.mode !== "tui") {
				ctx.ui.notify("System-prompt viewer requires TUI mode", "warning");
				return;
			}
			await ctx.ui.custom<void>((tui, _theme, _keybindings, done) => {
				void openEditor(tui, prompt, ctx, done, viewPrompt);
				return { render: () => [], invalidate: () => {} };
			});
		},
	};
}

export const defaultPromptViewer = createPromptViewer(
	(content) => viewInEditor(content, selectEditor()),
);

export async function openEditor(
	tui: { stop(): void; start(): void; requestRender(full?: boolean): void },
	prompt: string,
	ctx: ExtensionContext,
	done: () => void,
	viewPrompt: ViewPrompt,
): Promise<void> {
	tui.stop();
	try {
		await viewPrompt(prompt);
	} catch (error) {
		ctx.ui.notify(`Could not open editor: ${error instanceof Error ? error.message : "unknown error"}`, "warning");
	} finally {
		tui.start();
		tui.requestRender(true);
		done();
	}
}

export function registerViewSystemPrompt(pi: ExtensionAPI, promptViewer: PromptViewer = defaultPromptViewer): void {
	let latestPrompt: string | undefined;
	pi.on("before_agent_start", (event) => {
		latestPrompt = event.systemPrompt;
	});
	pi.registerCommand("view-system-prompt", {
		description: "Open the current system prompt in an external editor",
		handler: async (_args, ctx) => promptViewer.view(latestPrompt ?? ctx.getSystemPrompt(), ctx),
	});
}
