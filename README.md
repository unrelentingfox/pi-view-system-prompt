# pi-view-system-prompt

[![npm version](https://img.shields.io/npm/v/pi-view-system-prompt)](https://www.npmjs.com/package/pi-view-system-prompt)
[![npm downloads](https://img.shields.io/npm/dm/pi-view-system-prompt)](https://www.npmjs.com/package/pi-view-system-prompt)
[![CI](https://img.shields.io/github/actions/workflow/status/unrelentingfox/pi-view-system-prompt/ci.yml?branch=main&label=CI)](https://github.com/unrelentingfox/pi-view-system-prompt/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/unrelentingfox/pi-view-system-prompt/graph/badge.svg)](https://app.codecov.io/gh/unrelentingfox/pi-view-system-prompt)
[![Node.js](https://img.shields.io/node/v/pi-view-system-prompt)](https://www.npmjs.com/package/pi-view-system-prompt)
[![License](https://img.shields.io/github/license/unrelentingfox/pi-view-system-prompt)](https://github.com/unrelentingfox/pi-view-system-prompt/blob/main/LICENSE)

A Pi extension that opens the current system prompt in an external editor.

## Compatibility

Requires Node.js 22.19 or later and a current Pi installation. The runtime Pi dependency is an optional wildcard peer dependency so Pi provides the package when it loads the extension.

## Install and use

```sh
pi install npm:pi-view-system-prompt
```

Reload Pi, then run `/view-system-prompt`.

The extension records the prompt supplied to its latest `before_agent_start` hook. Before the first observed agent turn, it uses `ctx.getSystemPrompt()`.

In Terminal User Interface (TUI) mode, Pi suspends while the selected editor opens a private temporary Markdown file. The extension selects `$VISUAL`, then `$EDITOR`, then Notepad on Windows or `nano` elsewhere. It waits for exit and removes the temporary directory; edits are discarded.

Outside TUI mode, the command displays a concise warning. Prompt content is not written to session history, model context, logs, status text, or notifications.

## Security

The temporary file contains system-prompt content. Use a trusted local editor and do not share prompt content. Report vulnerabilities privately to the maintainer; see [SECURITY.md](SECURITY.md).

## Ordering limitation

Pi runs `before_agent_start` extension handlers in registration order. Therefore the captured prompt excludes later extension hooks and any later provider-payload rewrites.

## Development

```sh
npm ci
npm run check
npm pack --dry-run --json
```

`npm run check` runs c8 coverage with at least 95% lines across every executable production TypeScript file; TypeScript checks; and package-content verification. Run `npm run hooks:install` to enable the tracked Conventional Commit hook. See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution requirements and [RELEASING.md](RELEASING.md) for the automated release process.
