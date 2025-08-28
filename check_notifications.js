const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'http://localhost:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkNotificationsTable() {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .limit(1);

    if (error && error.code === '42P01') {
      console.log('La table notifications n\'existe pas.');
    } else if (error) {
      console.error('Erreur lors de la vérification de la table:', error.message);
    } else {
      console.log('La table notifications existe.');
    }
  } catch (err) {
    console.error('Erreur inattendue:', err.message);
  }
}

checkNotificationsTable();