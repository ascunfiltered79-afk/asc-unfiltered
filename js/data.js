export const DEMO_POSTS = [
  { id: 'example-1', kind: 'confession', nickname: 'Anonymous', body: 'My attendance is low but my chai-shop attendance is 100%. Priorities, I guess. ☕', created_at: '2026-11-20T12:00:00.000Z', sample: true },
  { id: 'example-2', kind: 'meme', nickname: 'Backbench Department', body: 'Group project breakdown: 1 person works, 3 people say “bro almost done?”, 5 people send reels. 💀', created_at: '2026-11-19T12:00:00.000Z', sample: true },
  { id: 'example-3', kind: 'tea', nickname: 'The Chai Committee', body: 'Campus tea of the day: the canteen table has heard more life plans than the career office. Purely a joke, of course.', created_at: '2026-11-18T12:00:00.000Z', sample: true },
  { id: 'example-4', kind: 'question', nickname: 'Anonymous', body: 'Dear Mask, how do I explain to my friends that I came to actually attend the lecture?', created_at: '2026-11-17T12:00:00.000Z', sample: true },
  { id: 'example-5', kind: 'media', nickname: 'Campus Diary', body: 'The iconic Amar Singh College campus deserves its own main-character moment. 📸', media_url: 'assets/campus.webp', created_at: '2026-11-16T12:00:00.000Z', sample: true }
];
export const DEMO_POLL = {
  id: 'demo-poll-1',
  question: 'What is the most dangerous sentence in college?',
  options: ['“Only five more minutes”', '“Attendance isn’t compulsory”', '“Surprise test today”', '“Let’s do a group project”'],
  is_open: true,
};
export const POST_TYPES = {
  confession: { label: 'CONFESSION', icon: '🤫', theme: 'pink' },
  meme: { label: 'MEME DROP', icon: '💀', theme: 'lime' },
  tea: { label: 'CAMPUS TEA', icon: '☕', theme: 'yellow' },
  question: { label: 'ASK THE MASK', icon: '🎭', theme: 'blue' },
  media: { label: 'CAMPUS DIARY', icon: '🎥', theme: 'pink' }
};
export const DEMO_KEY = 'asc_unfiltered_demo_v1';

export function getDemoStore(){
  try {
    const data = JSON.parse(localStorage.getItem(DEMO_KEY) || '{}');
    return { submissions: Array.isArray(data.submissions) ? data.submissions : [], votes: data.votes || {}, reports: Array.isArray(data.reports) ? data.reports : [], polls: Array.isArray(data.polls) ? data.polls : [DEMO_POLL] };
  } catch { return { submissions: [], votes: {}, reports: [], polls: [DEMO_POLL] }; }
}
export function saveDemoStore(store){
  localStorage.setItem(DEMO_KEY, JSON.stringify(store));
  window.dispatchEvent(new CustomEvent('asc-demo-updated'));
}
export function safeMediaUrl(value) {
  if (!value) return '';
  if (value === 'assets/campus.webp') return value;
  try { const url = new URL(value); return url.protocol === 'https:' ? url.href : ''; } catch { return ''; }
}
export function shortDate(value) {
  if (!value) return 'JUST NOW';
  try { return new Intl.DateTimeFormat('en-IN', { day:'numeric', month:'short' }).format(new Date(value)).toUpperCase(); } catch { return 'RECENT'; }
}
