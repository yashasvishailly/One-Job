import test from 'node:test';
import assert from 'node:assert/strict';

test('stored tokens cannot unlock the builder without server verification; unauthorized exports clear access',async()=>{
  const saved=new Map([['one-job-buyer-session-v1','forged-token']]);
  const originalFetch=globalThis.fetch;
  globalThis.sessionStorage={getItem:key=>saved.get(key),setItem:(key,value)=>saved.set(key,value),removeItem:key=>saved.delete(key)};
  let status=401;
  globalThis.fetch=async()=>({ok:status===200,status,json:async()=>status===200?{ok:true,expires:Date.now()+60000}:{error:'Sign in'}});
  try{
    const access=await import('../buyer-access.mjs');
    assert.equal(access.isVerified(),false);
    assert.equal(await access.verifyAccess(),false);
    assert.equal(saved.size,0);
    status=200;
    assert.equal(await access.acceptAccess({token:'verified-test-token'}),true);
    assert.equal(access.isVerified(),true);
    status=401;
    await assert.rejects(access.generateSetup({}),/Sign in/);
    assert.equal(access.isVerified(),false);assert.equal(saved.size,0);
  }finally{globalThis.fetch=originalFetch;delete globalThis.sessionStorage;}
});
