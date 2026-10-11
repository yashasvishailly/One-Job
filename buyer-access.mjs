const API='https://one-job-search.yshailly.workers.dev/api/access';
const KEY='one-job-buyer-session-v1';
let token='',verified=false,expires=0;
try{token=sessionStorage.getItem(KEY)||'';}catch{}
function remember(value){token=value;verified=false;expires=0;try{if(value)sessionStorage.setItem(KEY,value);else sessionStorage.removeItem(KEY);}catch{}}
async function request(path,body){
  const response=await fetch(API+path,{method:body===undefined?'GET':'POST',headers:{...(body===undefined?{}:{'Content-Type':'application/json'}),...(token?{Authorization:'Bearer '+token}:{})},...(body===undefined?{}:{body:JSON.stringify(body)}),cache:'no-store',credentials:'omit'});
  let data;try{data=await response.json();}catch{throw new Error('Buyer access is temporarily unavailable. Please try again or contact support.');}
  if(!response.ok){if(response.status===401)remember('');throw new Error(response.status===404?'Buyer sign-in is temporarily unavailable. Please try again later or contact support.':data.error||'Buyer access is temporarily unavailable.');}
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
export async function initializeAccess(){
  const link=window.__oneJobAccessLink;delete window.__oneJobAccessLink;
  if(link){const data=await request('/exchange',{token:link});return acceptAccess(data.access);}
  return verifyAccess();
}
export async function requestSignIn(email,receipt){return request('/request',{email,receipt});}
export async function generateSetup(profile){return request('/setup',{profile});}
export async function signOut(){try{if(token)await request('/logout',{});}finally{remember('');}}
