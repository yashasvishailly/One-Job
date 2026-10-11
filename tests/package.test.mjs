import test from 'node:test';
import assert from 'node:assert/strict';
import * as profile from '../package.mjs';
test('public profile helpers validate input without exposing buyer setup generation',()=>{
  assert.ok(profile.validateProfile(profile.normalizeProfile()));
  const p=profile.normalizeProfile({roles:['Chief of Staff'],experience:'Senior',locations:'Remote',flexible:true,assistant:'Gemini'});
  assert.equal(profile.validateProfile(p),'');assert.equal(p.assistant,'Gemini');
  for(const key of ['setupDocument','packageFiles','makeZip','KICKOFF'])assert.equal(profile[key],undefined);
});
