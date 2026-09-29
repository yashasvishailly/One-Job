import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {normalizeProfile,validateProfile,profileData,setupDocument,packageFiles,makeZip,csv,TRACKER_COLUMNS} from '../package.mjs';

const valid=()=>normalizeProfile({name:'Jane Doe',roles:['Chief of Staff'],experience:'Senior IC; no junior roles',locations:'India remote',salary:'3000000',currency:'INR'});

test('incomplete profiles cannot produce a ready-to-use package',()=>{
  assert.ok(validateProfile(normalizeProfile()));
  assert.throws(()=>setupDocument(normalizeProfile()));
  assert.ok(validateProfile({...valid(),experience:'  '}));
  assert.ok(validateProfile({...valid(),locations:'  '}));
  assert.ok(validateProfile({...valid(),roles:[],customRole:' , '}));
});
test('compensation requires a positive amount or an explicit flexible choice',()=>{
  for(const salary of ['','0','-1','NaN','Infinity','1e99','2000000000000'])assert.ok(validateProfile({...valid(),salary}));
  assert.equal(validateProfile({...valid(),salary:'',flexible:true}),'');
  assert.deepEqual(profileData({...valid(),flexible:true}).annual_compensation_floor,{flexible:true});
});
test('custom roles and unicode preferences survive package generation',()=>{
  const p={...valid(),name:'李明',roles:[],customRole:'Expansion, EIR',locations:'München · 東京'};
  const files=packageFiles(p),data=JSON.parse(files.find(([name])=>name.endsWith('profile.json'))[1]);
  assert.deepEqual(data.target_roles,['Expansion','EIR']);
  assert.equal(data.name,'李明');assert.equal(data.acceptable_locations,'München · 東京');
  assert.ok(setupDocument(p).includes('München · 東京'));
});
test('browser persistence and unknown fields are excluded from exported profile',()=>{
  const p=normalizeProfile({...valid(),remember:true,apiKey:'should-not-export',resume:'should-not-export'});
  const data=profileData(p);
  assert.equal(data.remember,undefined);assert.equal(data.apiKey,undefined);
  assert.ok(!JSON.stringify(data).includes('should-not-export'));
});
test('setup requires the purchased guide and contains no paid workflow or sample identity',()=>{
  const doc=setupDocument({...valid(),name:''});
  assert.ok(doc.includes('[Your Name]'));
  assert.ok(doc.includes('## First-run checks'));assert.ok(doc.includes('purchased One Job'));
  assert.ok(!packageFiles(valid()).some(([name])=>name.endsWith('SKILL.md')));
  assert.ok(!doc.includes('Jane Doe'));assert.ok(!doc.includes('Northstar'));
  assert.ok(!doc.includes('description: Run a focused'));
});
test('generated ZIP opens in an independent standard-library reader, verifies CRCs and preserves content',()=>{
  const files=packageFiles({...valid(),name:'李明'}),zip=makeZip(files);
  const result=spawnSync('python3',['-c',`import sys, io, zipfile, json
z=zipfile.ZipFile(io.BytesIO(sys.stdin.buffer.read()))
assert z.testzip() is None
print(json.dumps({n:z.read(n).decode('utf-8') for n in z.namelist()}))`],{input:zip});
  assert.equal(result.status,0,result.stderr.toString());
  assert.deepEqual(JSON.parse(result.stdout),Object.fromEntries(files));
});
test('tracker CSV has distinct fields; exports escape formulas and multiline drafts',()=>{
  assert.equal(new Set(TRACKER_COLUMNS).size,TRACKER_COLUMNS.length);
  const data=csv([['=HYPERLINK("x")','line 1\nline 2','a,b','He said "yes"']]);
  const r=spawnSync('python3',['-c',`import sys,csv,json
print(json.dumps(list(csv.reader(sys.stdin))))`],{input:data});
  assert.equal(r.status,0);
  assert.deepEqual(JSON.parse(r.stdout),[[`'=HYPERLINK("x")`,'line 1\nline 2','a,b','He said "yes"']]);
});
test('untrusted saved settings cannot add roles or unexpected configuration',()=>{
  const p=normalizeProfile({roles:['Chief of Staff','<script>'],assistant:'unexpected',currency:'garbage',remember:'true',exclusions:'x'.repeat(3000)});
  assert.deepEqual(p.roles,['Chief of Staff']);assert.equal(p.assistant,'Not decided yet');
  assert.equal(p.currency,'INR');assert.equal(p.remember,false);assert.equal(p.exclusions.length,1500);
});

test('assistant choice survives normalization and exported setup',()=>{
  for(const assistant of ['Claude','Gemini','Copilot','Another assistant']){
    const p=normalizeProfile({...valid(),assistant});
    assert.equal(p.assistant,assistant);
    assert.equal(profileData(p).assistant,assistant);
    assert.ok(setupDocument(p).includes(`"assistant": "${assistant}"`));
  }
});
