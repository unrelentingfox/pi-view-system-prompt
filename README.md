# pi-view-system-prompt

A Pi extension that opens the current system prompt in an external editor.

## Install

```sh
pi install npm:pi-view-system-prompt
```

Reload Pi, then run `/view-system-prompt`.

The extension records the prompt supplied to its latest `before_agent_start` hook. Before the first observed agent turn, it uses `ctx.getSystemPrompt()`.

In Terminal User Interface (TUI) mode, Pi suspends while the selected editor opens a private temporary Markdown file. The extension selects `$VISUAL`, then `$EDITOR`, then Notepad on Windows or `nano` elsewhere. It waits for exit and removes the temporary directory; edits are discarded.

Outside TUI mode, the command displays a concise warning. Prompt content is not written to session history, model context, logs, status text, or notifications.

## Ordering limitation

Pi runs `before_agent_start` extension handlers in registration order. Therefore the captured prompt excludes later extension hooks and any later provider-payload rewrites.

## Development

```sh
npm install
npm test
npm run typecheck
npm run pack:check
```
