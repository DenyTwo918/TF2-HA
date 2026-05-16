'use strict';
// Analyze the renderPublishWizard version guard (line 1015)

// The guard condition:
// if(data.version && data.ok && data.steps===undefined && data.candidate_draft_id===undefined && data.classifieds_maintainer===undefined)

console.log('=== renderPublishWizard version guard analysis ===');
console.log('');

// Scenario 1: Fresh install, no data yet
const scenario1 = {
  version: '5.13.49',
  ok: true
  // no steps, no candidate_draft_id, no classifieds_maintainer
};
console.log('Scenario 1: Fresh startup, no maintainer initialized yet');
console.log('data.version:', scenario1.version, '(truthy)');
console.log('data.ok:', scenario1.ok, '(truthy)');
console.log('data.steps === undefined:', scenario1.steps === undefined, '(true)');
console.log('data.candidate_draft_id === undefined:', scenario1.candidate_draft_id === undefined, '(true)');
console.log('data.classifieds_maintainer === undefined:', scenario1.classifieds_maintainer === undefined, '(true)');
console.log('GUARD TRIGGERS:', !!(scenario1.version && scenario1.ok && scenario1.steps===undefined && scenario1.candidate_draft_id===undefined && scenario1.classifieds_maintainer===undefined));
console.log('Result: Shows "data mapping mismatch" error instead of graceful "not ready"');
console.log('');

// Scenario 2: Normal response with data
const scenario2 = {
  version: '5.13.49',
  ok: true,
  classifieds_maintainer: { enabled: true },
  candidate_draft_id: 'draft_123'
};
console.log('Scenario 2: Normal response with maintainer data');
console.log('GUARD TRIGGERS:', !!(scenario2.version && scenario2.ok && scenario2.steps===undefined && scenario2.candidate_draft_id===undefined && scenario2.classifieds_maintainer===undefined));
console.log('Result: Guard does NOT trigger - correct behavior');
console.log('');

// Scenario 3: Publish wizard returns old format response
const scenario3 = {
  version: '5.13.49',
  ok: true,
  steps: [],
  backpack_tf_write_mode: 'off'
};
console.log('Scenario 3: Old format response (has steps but no classifieds_maintainer)');
console.log('GUARD TRIGGERS:', !!(scenario3.version && scenario3.ok && scenario3.steps===undefined && scenario3.candidate_draft_id===undefined && scenario3.classifieds_maintainer===undefined));
console.log('Result: Guard does NOT trigger because steps is defined');
console.log('');

console.log('=== Issue ===');
console.log('The guard is too specific. A valid response from /api/publish-wizard/status');
console.log('that simply has no maintainer/candidate initialized yet will trigger a');
console.log('misleading "data mapping mismatch" error.');
console.log('');
console.log('=== Better approach ===');
console.log('Check if the response structure matches /api/status instead:');
console.log('if (data.version && data.ok && data.steam_web_api_key_saved !== undefined)');
console.log('This would detect when the wrong endpoint response is returned.');
