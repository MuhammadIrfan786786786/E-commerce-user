window.trackUserActivity = async (email, eventType) => {
  if (!email || typeof supabase === 'undefined') return;
  const { error } = await supabase.from('login_activity').insert([{
    email,
    event_type: eventType,
    created_at: new Date().toISOString()
  }]);
  if (error) console.error('Activity tracking failed:', error.message);
};
