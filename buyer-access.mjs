const API='https://one-job-search.yshailly.workers.dev/api/access';
const KEY='one-job-buyer-session-v1';
const PENDING_KEY='one-job-pending-access-v1';
let token='',verified=false,expires=0,pendingLink='',initialization=null;
try{token=sessionStorage.getItem(KEY)||'';pendingLink=sessionStorage.getItem(PENDING_KEY)||'';}catch{}
function remember(value){token=value;verified=false;expires=0;try{if(value)sessionStorage.setItem(KEY,value);else sessionStorage.removeItem(KEY);}catch{}}
function rememberLink(link){pendingLink=link;window.__oneJobAccessLink=link;try{sessionStorage.setItem(PENDING_KEY,link);}catch{}}
function forgetLink(){
  pendingLink='';if(typeof window!=='undefined')delete window.__oneJobAccessLink;
  try{sessionStorage.removeItem(PENDING_KEY);}catch{}
  try{const page=window.location;if(page?.hash.startsWith('#access='))window.history.replaceState(null,'',page.pathname+page.search+'#setup');}catch{}
}
async function request(path,body){
  const response=await fetch(API+path,{method:body===undefined?'GET':'POST',headers:{...(body===undefined?{}:{'Content-Type':'application/json'}),...(token?{Authorization:'Bearer '+token}:{})},...(body===undefined?{}:{body:JSON.stringify(body)}),cache:'no-store',credentials:'omit'});
  let data;try{data=await response.json();}catch{throw new Error('Buyer access is temporarily unavailable. Please try again or contact support.');}
  if(!response.ok){
    if(response.status===401)remember('');
    const error=new Error(response.status===404?'Buyer sign-in is temporarily unavailable. Please try again later or contact support.':data?.error||'Buyer access is temporarily unavailable.');
    error.status=response.status;throw error;
  }
  return data;
}
export const isVerified=()=>verified&&expires>Date.now();
export async function verifyAccess(){
  if(!token)return false;
  try{const data=await request('/session');verified=data.ok===true;expires=Number(data.expires)||0;return isVerified();}
  catch{verified=false;return false;}
}
export async function acceptAccess(access){
  if(!access||typeof access.token!=='string')return false;
  remember(access.token);return verifyAccess();
}
async function initializeOnce(){
  const link=window.__oneJobAccessLink||pendingLink;
  if(!link)return verifyAccess();
  rememberLink(link);
  try{
    const data=await request('/exchange',{token:link});
    if(!data?.access||typeof data.access.token!=='string'||!data.access.token)throw new Error('Buyer access is temporarily unavailable. Please try again or contact support.');
    // Once exchanged, retry session verification with the issued token instead
    // of consuming the one-time link again after a temporary session-check failure.
    remember(data.access.token);forgetLink();return verifyAccess();
  }catch(error){
    if([400,401,403,410].includes(error?.status))forgetLink();
    throw error;
  }
}
export function initializeAccess(){
  if(!initialization)initialization=initializeOnce().finally(()=>{initialization=null;});
  return initialization;
}
export async function requestSignIn(email,receipt){return request('/request',{email,receipt});}
export async function generateSetup(profile){return request('/setup',{profile});}
export async function signOut(){try{if(token)await request('/logout',{});}finally{remember('');forgetLink();}}
