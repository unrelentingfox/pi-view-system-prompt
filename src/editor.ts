import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";

export interface EditorDependencies {
	createTempDirectory: () => Promise<string>;
	writePrompt: (path: string, prompt: string) => Promise<void>;
	removeTempDirectory: (path: string) => Promise<void>;
	runEditor: (editor: string, path: string) => Promise<void>;
}

const defaults: EditorDependencies = {
	createTempDirectory: () => mkdtemp(join(tmpdir(), "pi-system-prompt-")),
	writePrompt: (path, prompt) => writeFile(path, prompt, "utf8"),
	removeTempDirectory: (path) => rm(path, { recursive: true, force: true }),
	runEditor: (editor, path) => new Promise((resolve, reject) => {
		const [command, ...arguments_] = editor.split(/\s+/).filter(Boolean);
		if (!command) return reject(new Error("Editor command is empty"));
		const child = spawn(command, [...arguments_, path], { stdio: "inherit" });
		child.once("error", reject);
		child.once("exit", (code) => code === 0 ? resolve() : reject(new Error(`Editor exited with code ${code ?? "unknown"}`)));
	}),
};

export function selectEditor(environment: NodeJS.ProcessEnv = process.env, platform = process.platform): string {
	return environment.VISUAL || environment.EDITOR || (platform === "win32" ? "notepad" : "nano");
}

export async function viewInEditor(prompt: string, editor: string, dependencies: EditorDependencies = defaults): Promise<void> {
	const directory = await dependencies.createTempDirectory();
	try {
		const path = join(directory, "system-prompt.md");
		await dependencies.writePrompt(path, prompt);
		await dependencies.runEditor(editor, path);
	} finally {
		await dependencies.removeTempDirectory(directory);
	}
}
