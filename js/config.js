/**
 * ASC UNFILTERED configuration
 * Demo mode is active while either Supabase value is blank.
 * The "anon"/"publishable" key is designed to be public; NEVER paste a service_role/secret key here.
 */
export const CONFIG = {
  supabaseUrl: 'https://gydvpmuuejjzzeqyxery.supabase.co',
  supabaseAnonKey: 'sb_publishable_ILA7nIE7c651iXpC8tA3Ow_002LrM0n',
  instagramUrl: 'https://www.instagram.com/_asc.unfiltered/',
  siteTitle: 'ASC UNFILTERED',
};

export const LIVE_MODE = Boolean(CONFIG.supabaseUrl.trim() && CONFIG.supabaseAnonKey.trim());
