const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');
const source = readFileSync('transcript.js', 'utf8');

function fixture({ lines = [], initiallyOpen = false, available = true, navigate = false } = {}) {
  let time = 0;
  let open = initiallyOpen;
  let expanded = false;
  const location = new URL('https://www.youtube.com/watch?v=example');
  const visible = { getClientRects: () => [1] };
  const panel = { ...visible, querySelectorAll: () => lines.map(textContent => ({ textContent })) };
  const button = { ...visible, click() { open = true; } };
  const more = { ...visible, click() { expanded = true; } };
  const document = {
    querySelectorAll(selector) {
      if (selector.includes('engagement-panel')) return open ? [panel] : [];
      return available && expanded ? [button] : [];
    },
    querySelector: () => more
  };
  const context = vm.createContext({
    URL, location, document, Date: { now: () => time },
    setTimeout(resolve, ms) { time += ms; if (navigate) location.href = 'https://www.youtube.com/watch?v=other'; resolve(); }
  });
  vm.runInContext(source, context);
  return { run: () => context.grabTranscript(), location, isOpen: () => open };
}

test('opens collapsed description and transcript; copies clean text in order', async () => {
  const page = fixture({ lines: ['  First\n sentence. ', '', 'Second sentence.', 'Second sentence.'] });
  const result = await page.run();
  assert.equal(result.text, 'First sentence.\nSecond sentence.\nSecond sentence.');
  assert.equal(result.lines, 3);
  assert.equal(page.isOpen(), true);
});
test('uses an already open transcript', async () => {
  const result = await fixture({ initiallyOpen: true, lines: ['Already here.'] }).run();
  assert.equal(result.text, 'Already here.');
});
test('reports unavailable transcripts instead of copying empty text', async () => {
  await assert.rejects(fixture({ available: false }).run(), /Couldn't load a transcript/);
});
test('rejects unsupported pages', async () => {
  const page = fixture();
  page.location.href = 'https://example.com/watch?v=example';
  await assert.rejects(page.run(), /Open a video/);
});
test('stops when YouTube navigates to another video', async () => {
  await assert.rejects(fixture({ navigate: true }).run(), /video changed/);
});

function popup({ url = 'https://www.youtube.com/watch?v=example', failCopy = false, result = { result: { text: 'Transcript text' } } } = {}) {
  const elements = Object.fromEntries(['status', 'transcript', 'copy', 'retry'].map(id => [id, {
    hidden: true, textContent: '', value: '', addEventListener() {}, focus() {}, select() { this.selected = true; }
  }]));
  let copied;
  let injected = false;
  const context = vm.createContext({
    URL, document: { getElementById: id => elements[id] }, grabTranscript() {},
    navigator: { clipboard: { async writeText(text) { if (failCopy) throw new Error('Denied'); copied = text; } } },
    chrome: {
      tabs: { async query() { return [{ id: 1, url }]; } },
      scripting: { async executeScript() { injected = true; return [result]; } }
    }
  });
  vm.runInContext(readFileSync('popup.js', 'utf8').replace(/run\(\);\s*$/, ''), context);
  return { elements, run: () => context.run(), copied: () => copied, injected: () => injected };
}
test('popup copies successful extraction', async () => {
  const page = popup(); await page.run();
  assert.equal(page.copied(), 'Transcript text');
  assert.match(page.elements.status.textContent, /Copied/);
});
test('clipboard failure exposes selectable text', async () => {
  const page = popup({ failCopy: true }); await page.run();
  assert.equal(page.elements.transcript.hidden, false);
  assert.equal(page.elements.transcript.value, 'Transcript text');
  assert.equal(page.elements.transcript.selected, true);
});
test('popup rejects non-video pages before injection', async () => {
  const page = popup({ url: 'https://example.com' }); await page.run();
  assert.equal(page.injected(), false);
  assert.equal(page.elements.retry.hidden, false);
});
test('injection errors are shown and leave the clipboard untouched', async () => {
  const page = popup({ result: { error: { message: 'Transcript unavailable' } } }); await page.run();
  assert.equal(page.elements.status.textContent, 'Transcript unavailable');
  assert.equal(page.copied(), undefined);
});
