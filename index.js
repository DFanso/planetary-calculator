import React from 'react';
import { render } from 'ink';
import { PassThrough } from 'node:stream';
import readline from 'node:readline';
import App from './App.jsx';

// ---------------------------------------------------------------------------
// Permanent fix: ink requires stdin.isTTY to be true in order to enable raw
// mode (keyboard input).  When running via `bun index.js` in a normal shell
// the stream sometimes doesn't have that flag set.  We create a PassThrough
// stream that mirrors every keypress from the real process.stdin but always
// reports isTTY = true, so ink can call setRawMode without throwing.
// ---------------------------------------------------------------------------

// Enable readline keypress events on the real stdin
readline.emitKeypressEvents(process.stdin);

// Create a proxy stream that ink will use as its stdin
const stdinProxy = new PassThrough();

// Mark it as a TTY so ink's raw-mode guard passes
stdinProxy.isTTY = true;

// ink calls stdin.ref() to keep the event loop alive — PassThrough doesn't
// have this method by default, so we add a no-op (process.stdin.ref() keeps
// the real loop alive anyway).
stdinProxy.ref   = () => { process.stdin.ref();   return stdinProxy; };
stdinProxy.unref = () => { process.stdin.unref(); return stdinProxy; };

stdinProxy.setRawMode = (enabled) => {
	// Delegate to the real stdin only when it supports raw mode
	if (process.stdin.isTTY && typeof process.stdin.setRawMode === 'function') {
		process.stdin.setRawMode(enabled);
	}
	return stdinProxy;
};

// Put the real stdin into raw mode so individual keypresses arrive
if (process.stdin.isTTY && typeof process.stdin.setRawMode === 'function') {
	process.stdin.setRawMode(true);
}
process.stdin.resume();
process.stdin.setEncoding('utf8');

// Forward every chunk from real stdin → proxy so ink receives it
process.stdin.on('data', (data) => {
	stdinProxy.write(data);
});

render(React.createElement(App), { stdin: stdinProxy, exitOnCtrlC: true });
