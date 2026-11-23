import { CONFIG, LIVE_MODE } from './config.js';
import { DEMO_POSTS, getDemoStore, saveDemoStore } from './data.js';
let client = null;
export const isLive = LIVE_MODE;

function fail(error){ if (error) throw new Error(error.message || String(error)); }
function makeId(){return globalThis.crypto?.randomUUID?.() || `demo-${Date.now()}-${Math.random().toString(36).slice(2)}`;}

export async function initialize(){
  if (!LIVE_MODE) return;
  const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
  client = createClient(CONFIG.supabaseUrl, CONFIG.supabaseAnonKey, {auth:{persistSession:true,autoRefreshToken:true}});
}
function db(){if (!client) throw new Error('The live service is not connected. Check js/config.js and your network.');return client;}

export async function getPosts(){
  if (!LIVE_MODE){
    const store=getDemoStore();
    return [...DEMO_POSTS,...store.submissions.filter(x=>x.status==='approved')].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
  }
  const {data,error}=await db().from('posts').select('id,kind,nickname,body,media_url,created_at').eq('status','approved').order('created_at',{ascending:false}).limit(75);
  fail(error);return data || [];
}
export async function sendSubmission(post){
  const clean={kind:post.kind,nickname:post.nickname || null,body:post.body,media_url:post.media_url || null,consent:true,status:'pending'};
  if (!LIVE_MODE){const s=getDemoStore();s.submissions.push({...clean,id:makeId(),created_at:new Date().toISOString()});saveDemoStore(s);return;}
  const {error}=await db().from('posts').insert(clean);fail(error);
}
export async function getPolls(){
  if (!LIVE_MODE)return getDemoStore().polls;
  const {data,error}=await db().from('polls').select('id,question,options,is_open,created_at').order('created_at',{ascending:false}).limit(15);
  fail(error);return data || [];
}
export async function getPollResults(poll){
  const counts=Array(poll.options.length).fill(0);
  if (!LIVE_MODE){const v=getDemoStore().votes[poll.id];if(v && Number.isInteger(v.choice))counts[v.choice]+=1;return counts;}
  const {data,error}=await db().rpc('get_poll_results',{p_poll_id:poll.id});fail(error);
  for(const r of data || []) if(Number.isInteger(r.option_index) && r.option_index<counts.length)counts[r.option_index]=Number(r.votes)||0;
  return counts;
}
export function votedChoice(pollId){
  if(!LIVE_MODE)return getDemoStore().votes[pollId]?.choice ?? null;
  const v=localStorage.getItem('asc_unfiltered_voted_'+pollId);return v===null ? null : Number(v);
}
export async function votePoll(poll,choice){
  if(votedChoice(poll.id)!==null)throw new Error('You already voted from this browser.');
  if(!poll.is_open)throw new Error('This poll is closed.');
  if(!Number.isInteger(choice)||choice<0||choice>=poll.options.length)throw new Error('Invalid choice.');
  if(!LIVE_MODE){const s=getDemoStore();s.votes[poll.id]={choice};saveDemoStore(s);return;}
  const {error}=await db().from('poll_votes').insert({poll_id:poll.id,option_index:choice});fail(error);
  localStorage.setItem('asc_unfiltered_voted_'+poll.id,String(choice));
}
export async function sendReport(postId,reason,details){
  const clean={post_id:postId,reason,details:details||null};
  if(!LIVE_MODE){const s=getDemoStore();s.reports.push({...clean,id:makeId(),created_at:new Date().toISOString()});saveDemoStore(s);return;}
  const {error}=await db().from('reports').insert(clean);fail(error);
}
export async function getAdminIdentity(){
  if(!LIVE_MODE)return {demo:true};
  const {data:{user},error}=await db().auth.getUser();if(error || !user)return null;
  const {data:allowed,error:roleError}=await db().rpc('is_site_admin');fail(roleError);
  return allowed ? {email:user.email,id:user.id} : null;
}
export async function signIn(email,password){
  const {error}=await db().auth.signInWithPassword({email,password});fail(error);
  const identity=await getAdminIdentity();
  if(!identity){await db().auth.signOut();throw new Error('This account is not authorized as a site admin.');}
  return identity;
}
export async function signOut(){if(LIVE_MODE)await db().auth.signOut();}
export async function getAdminData(){
  if(!LIVE_MODE){const s=getDemoStore();return {posts:s.submissions,reports:s.reports,polls:s.polls};}
  const [p,r,l]=await Promise.all([
    db().from('posts').select('*').order('created_at',{ascending:false}).limit(400),
    db().from('reports').select('*').order('created_at',{ascending:false}).limit(200),
    db().from('polls').select('*').order('created_at',{ascending:false}).limit(100)
  ]);fail(p.error);fail(r.error);fail(l.error);
  return {posts:p.data||[],reports:r.data||[],polls:l.data||[]};
}
export async function updatePostStatus(id,status){
  if(!['approved','rejected','pending'].includes(status))throw new Error('Invalid status');
  if(!LIVE_MODE){const s=getDemoStore();const p=s.submissions.find(x=>x.id===id);if(!p)throw new Error('Post not found');p.status=status;p.published_at=status==='approved'?new Date().toISOString():null;saveDemoStore(s);return;}
  const {error}=await db().from('posts').update({status,published_at:status==='approved'?new Date().toISOString():null}).eq('id',id);fail(error);
}
export async function publishAdminPost(post){
  const clean={...post,status:'approved',consent:true,published_at:new Date().toISOString()};
  if(!LIVE_MODE){const s=getDemoStore();s.submissions.push({...clean,id:makeId(),created_at:new Date().toISOString()});saveDemoStore(s);return;}
  const {error}=await db().from('posts').insert(clean);fail(error);
}
export async function createPoll(question,options){
  if(!LIVE_MODE){const s=getDemoStore();s.polls.unshift({id:makeId(),question,options,is_open:true,created_at:new Date().toISOString()});saveDemoStore(s);return;}
  const {error}=await db().from('polls').insert({question,options,is_open:true});fail(error);
}
export async function togglePoll(id,is_open){
  if(!LIVE_MODE){const s=getDemoStore();const p=s.polls.find(x=>x.id===id);if(p)p.is_open=is_open;saveDemoStore(s);return;}
  const {error}=await db().from('polls').update({is_open}).eq('id',id);fail(error);
}
export async function deleteReport(id){
  if(!LIVE_MODE){const s=getDemoStore();s.reports=s.reports.filter(x=>x.id!==id);saveDemoStore(s);return;}
  const {error}=await db().from('reports').delete().eq('id',id);fail(error);
}
