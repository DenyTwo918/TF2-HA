'use strict';
// Reproduce the esc2 quote-escaping bug in renderHubListingDrafts

const esc2 = s => String(s||'').replace(/&/g,'&').replace(/</g,'<').replace(/>/g,'>');

// Simulate a provider_payload_preview object that could come from Backpack.tf
const payload = {
  item_name: 'Mann Co. Supply Crate #42',
  quality: 'Unique',
  currencies: { metal: 1.33 },
  notes: 'Size: "Large" - must have'
};

const jsonStr = JSON.stringify(payload);
console.log('=== JSON string to embed ===');
console.log(jsonStr);
console.log('');

const escaped = esc2(jsonStr);
console.log('=== After esc2 (no quote escaping) ===');
console.log(escaped);
console.log('');

// The HTML attribute that gets generated
const html = `<button class="hubDraftCopyPayload" data-payload="${escaped}" style="font-size:0.8em;margin-top:4px">Copy Payload</button>`;
console.log('=== Generated HTML (BROKEN) ===');
console.log(html);
console.log('');

// Show what the browser would parse
const match = html.match(/data-payload="([^"]*)"/);
if (match) {
  console.log('=== What browser sees as data-payload value (truncated!) ===');
  console.log(match[1]);
  console.log('');
  console.log('Trying JSON.parse on this...');
  try {
    JSON.parse(match[1]);
    console.log('SUCCESS (unexpected)');
  } catch(e) {
    console.log('PARSE FAILED:', e.message);
  }
}

console.log('');
console.log('=== Root cause ===');
console.log('esc2 does not escape " character');
console.log('JSON.stringify output contains " characters');
console.log('HTML attribute value delimited by " breaks');
console.log('');
console.log('=== Fix ===');
console.log('Use esc() which escapes & < > "');
console.log('OR use encodeURIComponent() for data attributes');
