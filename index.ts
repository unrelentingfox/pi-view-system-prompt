import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { registerViewSystemPrompt } from "./src/index.ts";

export default function viewSystemPrompt(pi: ExtensionAPI): void {
	registerViewSystemPrompt(pi);
}
