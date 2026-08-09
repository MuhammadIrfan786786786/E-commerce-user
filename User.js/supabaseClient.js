const SUPABASE_URL = 'https://xllcmusdbjfwuipmrupf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_W4xi_k8Hs0rROZSJ84kFSw_CiSdEHHC';

// Safe Initialization: Check karte hain ke CDN se Supabase load hua ya nahi
if (window.supabase && typeof window.supabase.createClient === 'function') {
  var supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else if (window.Supabase && typeof window.Supabase.createClient === 'function') {
  var supabase = window.Supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
  console.error('Supabase library load nahi hui! Please head section me CDN script check karein.');
}