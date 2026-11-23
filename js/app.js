import { CONFIG, LIVE_MODE } from './config.js';
import { POST_TYPES, safeMediaUrl, shortDate } from './data.js';
import { initialize, getPosts, sendSubmission, getPolls, getPollResults, votedChoice, votePoll, sendReport } from './service.js';
const $ = (s,root=document)=>root.querySelector(s);
const $$ = (s,root=document)=>[...root.querySelectorAll(s)];
let allPosts=[];let currentFilter='all';let activePoll=null;let siteReady=false;let toastTimer;
function el(tag,className,text){const n=document.createElement(tag);if(className)n.className=className;if(text!==undefined)n.textContent=text;return n;}
function toast(message){const n=$('#toast');n.textContent=message;n.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>n.classList.remove('visible'),3800);}
function setFeedback(node,text,success){node.textContent=text;node.className='form-feedback '+(success?'success':'error');}
function applyLinks(){ $$('.social-link').forEach(a=>a.href=CONFIG.instagramUrl); $('#year').textContent=new Date().getFullYear(); }
function setMode(){const flag=el('span','mode-flag',LIVE_MODE?'● LIVE COMMUNITY':'◉ LOCAL DEMO');$('.eyebrow').append(flag);if(!LIVE_MODE){const p=el('div','demo-explainer','');p.textContent='DEMO MODE: submissions and votes are saved only in your browser. Connect Supabase before inviting students.';p.style.cssText='color:#e0fa8a;font:700 10px/1.6 var(--mono);max-width:450px;margin-top:12px';$('.hero-foot').after(p);}}
function attachMenu(){const b=$('#menuToggle');const nav=$('#navLinks');b.addEventListener('click',()=>{const expanded=b.getAttribute('aria-expanded')==='true';b.setAttribute('aria-expanded',String(!expanded));nav.classList.toggle('open',!expanded);});$$('.nav-links a,.nav-links button').forEach(x=>x.addEventListener('click',()=>{nav.classList.remove('open');b.setAttribute('aria-expanded','false');}));}
function openSubmission(kind='confession'){const d=$('#submitDialog');$('#postKind').value=kind;$('#submitFeedback').textContent='';d.showModal();$('#postBody').focus();}
function attachModals(){
  $$('[data-open-submit]').forEach(x=>x.addEventListener('click',()=>openSubmission(x.dataset.openSubmit)));
  $('#closeSubmit').addEventListener('click',()=>$('#submitDialog').close());
  $('#closeReport').addEventListener('click',()=>$('#reportDialog').close());
  $$('.modal').forEach(d=>d.addEventListener('click',e=>{if(e.target===d)d.close();}));
  $('#postBody').addEventListener('input',e=>{$('#charCount').textContent=`${e.target.value.length} / 700`;});
  $('#submitForm').addEventListener('submit',onSubmission);
  $('#reportForm').addEventListener('submit',onReport);
}
async function onSubmission(e){
  e.preventDefault();const b=$('#submitButton');const feedback=$('#submitFeedback');
  if(!siteReady){setFeedback(feedback,'The service is unavailable. Please try again after setup.',false);return;}
  if($('#postWebsite').value.trim())return;
  const kind=$('#postKind').value;const nickname=$('#postNickname').value.trim();const body=$('#postBody').value.trim();const rawMedia=$('#postMedia').value.trim();const media=safeMediaUrl(rawMedia);
  if(!POST_TYPES[kind] || body.length<8 || body.length>700){setFeedback(feedback,'Please write 8–700 characters.',false);return;}
  if(rawMedia && !media){setFeedback(feedback,'Please provide a complete HTTPS media link.',false);return;}
  if(!$('#postConsent').checked){setFeedback(feedback,'Please confirm the community rules.',false);return;}
  b.disabled=true;b.textContent='SENDING...';
  try{await sendSubmission({kind,nickname,body,media_url:media});$('#submitForm').reset();$('#charCount').textContent='0 / 700';setFeedback(feedback,LIVE_MODE?'Sent for private admin review. It will appear only if approved.':'Saved to this browser’s demo queue! Visit Admin sign-in to approve it.',true);toast('STORY RECEIVED. THE MASK WILL REVIEW IT. 🎭');}
  catch(err){setFeedback(feedback,err.message || 'Submission failed.',false);}
  finally{b.disabled=false;b.textContent='SEND TO THE MASK ↗';}
}
function looksLikeImage(url){return url==='assets/campus.webp'||/^https:\/\/[^\s]+\.(?:png|jpg|jpeg|gif|webp)(?:\?.*)?$/i.test(url);}
function createPostCard(post){
  const info=POST_TYPES[post.kind]||POST_TYPES.confession;const article=el('article',`post-card kind-${post.kind}`);article.dataset.id=post.id;
  const top=el('div','post-card-header');top.append(el('span','post-type',`${info.icon} ${info.label}`),el('span','post-date',shortDate(post.created_at)));article.append(top);
  article.append(el('p','post-body',post.body));const media=safeMediaUrl(post.media_url);
  if(media){if(looksLikeImage(media)){const img=el('img','post-image');img.loading='lazy';img.alt='Student-submitted campus media';img.referrerPolicy='no-referrer';img.src=media;img.onerror=()=>img.remove();article.append(img);}else{const link=el('a','post-media-link','VIEW SUBMITTED MEDIA ↗');link.href=media;link.target='_blank';link.rel='noopener noreferrer';article.append(link);}}
  const footer=el('div','post-card-footer');const meta=el('div');meta.append(el('div','post-author',`@ ${post.nickname || 'Anonymous'}`),el('div','post-meta',post.sample?'EXAMPLE POST • DEMO':'APPROVED BY ADMIN'));
  if(post.sample){footer.append(meta,el('span','post-meta','SAMPLE'));}else{const button=el('button','report-trigger','REPORT');button.type='button';button.addEventListener('click',()=>openReport(post.id));footer.append(meta,button);}article.append(footer);return article;
}
async function refreshFeed(){try{allPosts=await getPosts();renderFeed();}catch(err){const grid=$('#feedGrid');grid.replaceChildren();grid.append(el('div','post-placeholder',`Feed unavailable: ${err.message}`));}}
function renderFeed(){const shown=currentFilter==='all'?allPosts:allPosts.filter(p=>p.kind===currentFilter);const grid=$('#feedGrid');grid.replaceChildren();if(!shown.length){const empty=el('div','post-placeholder');empty.append(el('strong','','NOTHING HERE... YET.'),el('p','','Be the first to submit something worth sharing.'));grid.append(empty);}else shown.forEach(p=>grid.append(createPostCard(p)));$('#feedCount').textContent=`${shown.length} ${shown.length===1?'DROP':'DROPS'} ${LIVE_MODE?'LIVE':'IN DEMO'}`;}
function attachFilters(){$$('#feedFilters .filter').forEach(btn=>btn.addEventListener('click',()=>{currentFilter=btn.dataset.filter;$$('#feedFilters .filter').forEach(b=>{const active=b===btn;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});renderFeed();}));}
function openReport(postId){$('#reportForm').reset();$('#reportPostId').value=postId;$('#reportFeedback').textContent='';$('#reportDialog').showModal();}
async function onReport(e){e.preventDefault();const btn=$('#reportButton');const feedback=$('#reportFeedback');if(!siteReady){setFeedback(feedback,'Service unavailable.',false);return;}btn.disabled=true;try{await sendReport($('#reportPostId').value,$('#reportReason').value,$('#reportDetails').value.trim());setFeedback(feedback,'Thank you. Your report is in the review queue.',true);toast('REPORT RECEIVED. THANK YOU.');}catch(err){setFeedback(feedback,err.message,false);}finally{btn.disabled=false;}}
function renderPollCard(poll,counts,showResults){const root=$('#pollCard');root.replaceChildren();const title=el('span','poll-label',`${LIVE_MODE?'LIVE':'DEMO'} CAMPUS POLL / ${poll.is_open?'VOTING OPEN':'POLL CLOSED'}`);root.append(title,el('h3','',poll.question));const voted=votedChoice(poll.id);const total=counts.reduce((s,n)=>s+n,0);
  if(showResults||voted!==null||!poll.is_open){const results=el('div','poll-results');const max=Math.max(0,...counts);poll.options.forEach((option,i)=>{const item=el('div','result-item'+(counts[i]===max&&max>0?' winner':''));const row=el('div','result-row');row.append(el('span','',option+(voted===i?' ✓':'')),el('span','',total?Math.round(100*counts[i]/total)+'%':'0%'));const track=el('div','result-track');const fill=el('div','result-fill');fill.style.width=total?(100*counts[i]/total)+'%':'0%';track.append(fill);item.append(row,track);results.append(item);});root.append(results);
  }else{poll.options.forEach((option,i)=>{const button=el('button','poll-option');button.type='button';button.append(el('span','',option),el('span','','↗'));button.addEventListener('click',async()=>{const all=$$('.poll-option',root);all.forEach(b=>b.disabled=true);try{await votePoll(poll,i);const next=await getPollResults(poll);renderPollCard(poll,next,true);toast('YOUR VOTE IS IN 🗳️');}catch(err){toast(err.message);all.forEach(b=>b.disabled=false);}});root.append(button);});}
  const footer=el('div','poll-footer');footer.append(el('span','',`${total} ${total===1?'VOTE':'VOTES'} ${LIVE_MODE?'RECORDED':'ON THIS DEVICE'}`));if(voted===null && poll.is_open){const toggle=el('button','','');toggle.textContent=showResults?'← VOTE NOW':'VIEW RESULTS →';toggle.addEventListener('click',()=>renderPollCard(poll,counts,!showResults));footer.append(toggle);}root.append(footer);
}
async function loadPoll(){const root=$('#pollCard');try{const polls=await getPolls();activePoll=polls.find(p=>p.is_open)||polls[0];if(!activePoll){root.replaceChildren();root.append(el('div','post-placeholder','No campus polls yet. Check back soon!'));return;}const counts=await getPollResults(activePoll);renderPollCard(activePoll,counts,false);}catch(err){root.replaceChildren();root.append(el('div','post-placeholder',`Poll unavailable: ${err.message}`));}}
async function init(){applyLinks();attachMenu();attachModals();attachFilters();setMode();try{await initialize();siteReady=true;await Promise.all([refreshFeed(),loadPoll()]);}catch(err){toast('Live setup error: '+err.message);$('#feedGrid').textContent='Unable to connect to the live service. Review js/config.js.';$('#pollCard').textContent='Unable to load poll.';}}
init();
