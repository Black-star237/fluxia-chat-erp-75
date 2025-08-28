import { createClient } from '@supabase/supabase-js';

// Récupérer les informations depuis le fichier .env et la clé secrète
const supabaseUrl = 'https://hhkqazdivfkqcpcjdqbv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhoa3FhemRpdmZrcWNwY2pkcWJ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY3MjAzNywiZXhwIjoyMDcxMjQ4MDM3fQ.PInBw4rVRO5mV5LKFvxCN9Twzec3m9te5IXj3L5niwQ';

// Créer le client Supabase avec la clé secrète
const supabase = createClient(supabaseUrl, supabaseKey, {
  db: {
    schema: 'public',
  },
});

// Fonction pour créer la fonction RPC execute_sql
async function createExecuteSqlFunction() {
  try {
    const { data, error } = await supabase
      .from('pg_functions')
      .insert({
        name: 'execute_sql',
        schema: 'public',
        returns: 'void',
        language: 'sql',
        definition: 'SELECT exec($1);',
        arguments: ['query_text text']
      });

    if (error) {
      console.error('Erreur lors de la création de la fonction RPC :', error);
    } else {
      console.log('Fonction RPC execute_sql créée avec succès.');
    }
  } catch (err) {
    console.error('Erreur inattendue:', err);
  }
}

// Fonction pour exécuter le script SQL de création des triggers
async function createTriggers() {
  try {
    // Créer la fonction RPC execute_sql
    await createExecuteSqlFunction();

    // Lire le script SQL
    const fs = await import('fs/promises');
    const sqlScript = await fs.readFile('create_triggers.sql', 'utf8');

    // Diviser le script SQL en requêtes individuelles
    const queries = sqlScript.split(';').filter(query => query.trim() !== '');

    // Exécuter chaque requête individuellement
    for (const query of queries) {
      const { data, error } = await supabase.rpc('execute_sql', {
        query_text: query
      });

      if (error) {
        console.error('Erreur lors de l\'exécution de la requête :', error);
      } else {
        console.log('Requête exécutée avec succès :', query);
      }
    }

    console.log('Triggers créés avec succès.');
  } catch (err) {
    console.error('Erreur inattendue:', err);
  }
}

// Exécuter la fonction
createTriggers();