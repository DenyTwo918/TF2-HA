'use strict';
// Analyze the saveSelectedCredentials timeout issue

// Line 759: save call with 3000ms timeout
const saveTimeout = 3000;
// Line 771: verification call with 5000ms timeout  
const verifyTimeout = 5000;

console.log('=== saveSelectedCredentials timeout analysis ===');
console.log('');
console.log('Save endpoint: /api/main-account/save-local-only');
console.log('Save timeout: ' + saveTimeout + 'ms (3 seconds)');
console.log('Verify endpoint: /api/main-account/status');
console.log('Verify timeout: ' + verifyTimeout + 'ms (5 seconds)');
console.log('');
console.log('=== Race condition scenario ===');
console.log('1. User clicks Save');
console.log('2. POST /api/main-account/save-local-only with 3s timeout');
console.log('3. If save takes >3s (e.g., vault write is slow), it throws AbortError');
console.log('4. Error handler at line 761-764 catches it, shows "timed out"');
console.log('5. But the server may still be processing the save!');
console.log('6. Later, GET /api/main-account/status may see partial save state');
console.log('');
console.log('=== The fix ===');
console.log('Increase save timeout to at least 10000ms (10s) to match the');
console.log('status endpoint, or remove the timeout entirely since the');
console.log('endpoint is local to the HA add-on container.');
console.log('');
console.log('=== Additional issue: ===');
console.log('Line 771: const status = await api(\'/api/main-account/status\', {timeoutMs:5000}).catch(()=>data);');
console.log('If status fails, it falls back to `data` (the save result)');
console.log('But `data` may not have the full main_account object');
console.log('So at line 776, finalData.main_account could be undefined');
console.log('causing a crash on main.steam_id64_saved etc.');
