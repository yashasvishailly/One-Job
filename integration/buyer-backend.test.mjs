import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

// This suite intentionally uses the maintained server, not another implementation
// or mocked response shapes. Only storage, email delivery, and transport are fake.
const websiteRoot=process.env.ONE_JOB_WEBSITE_ROOT;
if(!websiteRoot)throw new Error('Set ONE_JOB_WEBSITE_ROOT to a checkout of yashasvishailly-com. See docs/backend-contract.md.');
const {handleBuyerAccess}=await import(pathToFileURL(path.resolve(websiteRoot,'workers/one-job-search/src/buyer-access.mjs')).href);
const origin='https://yashasvishailly.com';
let sequence=0;
const profile={roles:['Chief of Staff'],experience:'Senior',locations:'India remote',flexible:true,assistant:'Gemini'};

function fixture(){
  const originals={window:globalThis.window,sessionStorage:globalThis.sessionStorage,fetch:globalThis.fetch};
  const records=new Map(),saved=new Map(),mail=[];
  const email='buyer@example.com',purchaseKey='payment:pay_integration';
  records.set(purchaseKey,JSON.stringify({status:'delivered',email}));
  const env={JOBSEARCH_SESSIONS:{get:async key=>records.get(key)||null,put:async(key,value)=>{records.set(key,value);},delete:async key=>records.delete(key)}};
  globalThis.window={location:{hash:'#setup',pathname:'/',search:''},history:{replaceState(){}}};
  globalThis.sessionStorage={getItem:key=>saved.get(key)||null,setItem:(key,value)=>saved.set(key,value),removeItem:key=>saved.delete(key)};
  let dropExchange=false;
  async function request(url,init={}){
    const headers=new Headers(init.headers);headers.set('Origin',origin);
    const response=await handleBuyerAccess(new Request(url,{...init,headers}),env,async(address,link)=>mail.push({address,link}));
    if(dropExchange&&url.endsWith('/exchange')){dropExchange=false;throw new TypeError('Simulated lost exchange response');}
    return response;
  }
  globalThis.fetch=request;
  return {records,saved,mail,email,purchaseKey,env,dropNextExchange(){dropExchange=true;},async client(){return import('../buyer-access.mjs?backend='+sequence++);},close(){Object.assign(globalThis,originals);}};
}

test('delivered buyer signs in, generates an export, and signs out against the maintained backend',async()=>{
  const f=fixture();try{
    const client=await f.client();
    const generic=await client.requestSignIn('other@example.com','pay_unknown');
    assert.deepEqual(await client.requestSignIn(f.email,'pay_integration'),generic);
    assert.equal(f.mail.length,1);assert.equal(f.mail[0].address,f.email);
    window.__oneJobAccessLink=f.mail[0].link.split('#access=')[1];
    assert.equal(await client.initializeAccess(),true);
    const before=[...f.records];const result=await client.generateSetup(profile);
    assert.match(result.document,/India remote/);assert.ok(result.zip);assert.ok(result.tracker);assert.ok(result.kickoff);
    assert.deepEqual([...f.records],before,'export must not persist the buyer profile');
    await client.signOut();assert.equal(client.isVerified(),false);
    await assert.rejects(client.generateSetup(profile),/Sign in/);
  }finally{f.close();}
});

test('lost exchange response and reload recover with the original short-lived link',async()=>{
  const f=fixture();try{
    const first=await f.client();await first.requestSignIn(f.email,'pay_integration');
    window.__oneJobAccessLink=f.mail[0].link.split('#access=')[1];f.dropNextExchange();
    await assert.rejects(first.initializeAccess(),/lost exchange response/);
    assert.ok(f.saved.get('one-job-pending-access-v1'));
    delete window.__oneJobAccessLink;
    const restored=await f.client();assert.equal(await restored.initializeAccess(),true);
    assert.equal(f.saved.has('one-job-pending-access-v1'),false);
    assert.ok((await restored.generateSetup(profile)).zip);
  }finally{f.close();}
});

test('revoked purchases and expired sessions fail closed after successful sign-in',async()=>{
  const f=fixture();try{
    const client=await f.client();await client.requestSignIn(f.email,'pay_integration');
    window.__oneJobAccessLink=f.mail[0].link.split('#access=')[1];await client.initializeAccess();
    f.records.set(f.purchaseKey,JSON.stringify({status:'refunded',email:f.email}));
    await assert.rejects(client.generateSetup(profile),/Sign in/);assert.equal(client.isVerified(),false);
    f.records.set(f.purchaseKey,JSON.stringify({status:'delivered',email:f.email}));
    window.__oneJobAccessLink=f.mail[0].link.split('#access=')[1];await client.initializeAccess();
    for(const [key,value] of f.records)if(key.startsWith('buyer:session:'))f.records.set(key,JSON.stringify({...JSON.parse(value),expires:Date.now()-1}));
    assert.equal(await client.verifyAccess(),false);
  }finally{f.close();}
});

test('backend accepts the canonical production origin and rejects standalone or untrusted origins',async()=>{
  const f=fixture();try{
    for(const candidate of [origin,'https://yashasvishailly.github.io','https://untrusted.example']){
      const response=await handleBuyerAccess(new Request('https://worker.example/api/access/session',{headers:{Origin:candidate}}),f.env,()=>{throw Error('No email expected');});
      assert.equal(response.status,candidate===origin?401:403);
      assert.equal(response.headers.get('Cache-Control'),'no-store');
      assert.equal(response.headers.get('Access-Control-Allow-Origin'),origin);
    }
  }finally{f.close();}
});
