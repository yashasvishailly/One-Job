import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function browser(saved=new Map(),blocked=false){
  const original={window:globalThis.window,sessionStorage:globalThis.sessionStorage,fetch:globalThis.fetch};
  globalThis.window={location:{hash:'#setup',pathname:'/',search:''},history:{replaceState(){}}};
  globalThis.sessionStorage={getItem:key=>{if(blocked)throw Error('blocked');return saved.get(key);},setItem(key,value){if(blocked)throw Error('blocked');saved.set(key,value);},removeItem(key){if(blocked)throw Error('blocked');saved.delete(key);}};
  return {saved,close(){Object.assign(globalThis,original);}};
}
const load=name=>import('../buyer-access.mjs?recovery='+name);
const session=()=>Response.json({ok:true,expires:Date.now()+60000});
test('exchange failure survives a reload and only clears the link once a session is issued',async()=>{
  const b=browser();try{
    window.__oneJobAccessLink='magic-link';
    globalThis.fetch=async()=>Response.json({error:'Unavailable'},{status:503});
    const first=await load('first');await assert.rejects(first.initializeAccess(),/Unavailable/);
    assert.equal(b.saved.get('one-job-pending-access-v1'),'magic-link');
    delete window.__oneJobAccessLink;
    const restored=await load('restored');let exchanges=0;
    globalThis.fetch=async(url,init)=>{
      if(url.endsWith('/exchange')){exchanges++;assert.equal(JSON.parse(init.body).token,'magic-link');return Response.json({access:{token:'issued-session'}});}
      return session();
    };
    assert.equal(await restored.initializeAccess(),true);assert.equal(exchanges,1);
    assert.equal(b.saved.has('one-job-pending-access-v1'),false);
    assert.equal(window.__oneJobAccessLink,undefined);
  }finally{b.close();}
});
test('issued sessions are retried without consuming the one-time link again',async()=>{
  const b=browser();try{
    window.__oneJobAccessLink='magic-link';let exchange=0,checks=0;
    globalThis.fetch=async url=>url.endsWith('/exchange')?(exchange++,Response.json({access:{token:'issued-session'}})):(++checks===1?Response.json({error:'Temporary'},{status:503}):session());
    const access=await load('verification-retry');
    assert.equal(await access.initializeAccess(),false);assert.equal(await access.initializeAccess(),true);
    assert.equal(exchange,1);assert.equal(checks,2);
  }finally{b.close();}
});
test('concurrent initialization shares one exchange and blocked storage retains in-memory retry',async()=>{
  const b=browser(new Map(),true);try{
    window.__oneJobAccessLink='memory-link';let release,exchanges=0;
    globalThis.fetch=async()=>Response.json({error:'Unavailable'},{status:503});
    const access=await load('memory');await assert.rejects(access.initializeAccess());
    assert.equal(window.__oneJobAccessLink,'memory-link');
    globalThis.fetch=url=>url.endsWith('/exchange')?(exchanges++,new Promise(resolve=>{release=()=>resolve(Response.json({access:{token:'issued-session'}}));})):Promise.resolve(session());
    const first=access.initializeAccess(),second=access.initializeAccess();assert.equal(first,second);release();
    assert.deepEqual(await Promise.all([first,second]),[true,true]);assert.equal(exchanges,1);
  }finally{b.close();}
});
test('expired links are cleared instead of retried indefinitely',async()=>{
  const b=browser();try{
    window.__oneJobAccessLink='expired-link';let exchanges=0;
    globalThis.fetch=async()=>{exchanges++;return Response.json({error:'Expired'},{status:410});};
    const access=await load('expired');await assert.rejects(access.initializeAccess(),/Expired/);
    assert.equal(b.saved.has('one-job-pending-access-v1'),false);assert.equal(await access.initializeAccess(),false);assert.equal(exchanges,1);
  }finally{b.close();}
});
test('the early fragment handler scrubs the address only after preserving a reload-safe copy',()=>{
  const source=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
  for(const blocked of [false,true]){
    const saved=new Map(),location={hash:'#access=magic-link',pathname:'/',search:''};let replaced=false;
    const context={window:{},location,sessionStorage:{setItem(key,value){if(blocked)throw Error('blocked');saved.set(key,value);}},history:{replaceState(){replaced=true;}}};
    vm.runInNewContext(source,context);
    assert.equal(context.window.__oneJobAccessLink,'magic-link');assert.equal(replaced,!blocked);
    if(!blocked)assert.equal(saved.get('one-job-pending-access-v1'),'magic-link');
  }
});
