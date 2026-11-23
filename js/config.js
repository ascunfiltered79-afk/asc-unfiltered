/**
 * ASC UNFILTERED configuration
 * Demo mode is active while either Supabase value is blank.
 * The "anon"/"publishable" key is designed to be public; NEVER paste a service_role/secret key here.
 */
export const CONFIG = {
  supabaseUrl: '',
  supabaseAnonKey: '',
  instagramUrl: 'https://www.instagram.com/asc.unfiltered/',
  siteTitle: 'ASC UNFILTERED',
};

export const LIVE_MODE = Boolean(CONFIG.supabaseUrl.trim() && CONFIG.supabaseAnonKey.trim());
