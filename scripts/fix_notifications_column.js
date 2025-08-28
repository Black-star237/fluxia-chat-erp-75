const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixNotificationsColumn() {
  try {
    // Vérifier la structure actuelle de la table notifications
    const { data: columns, error: columnsError } = await supabase
      .rpc('get_table_columns', { table_name: 'notifications' })
      .catch(() => {
        // Si la fonction RPC n'existe pas, on utilise une requête directe
        return { data: null, error: { message: "RPC not available" } };
      });

    if (columnsError || !columns) {
      console.log("La fonction RPC n'est pas disponible. Utilisation d'une approche directe.");
    }

    // Exécuter le script SQL directement via Supabase
    const script = `
      -- Vérification de la structure actuelle de la table notifications
      SELECT column_name, data_type FROM information_schema.columns
      WHERE table_name = 'notifications';

      -- Vérification de l'existence de la colonne userId
      DO $$
      BEGIN
          IF NOT EXISTS (
              SELECT 1
              FROM information_schema.columns
              WHERE table_name = 'notifications' AND column_name = 'userId'
          ) THEN
              RAISE NOTICE 'La colonne userId n''existe pas dans la table notifications.';

              -- Vérification de l'existence d'une colonne alternative comme user_id ou userid
              IF EXISTS (
                  SELECT 1
                  FROM information_schema.columns
                  WHERE table_name = 'notifications' AND column_name = 'user_id'
              ) THEN
                  RAISE NOTICE 'La colonne user_id existe. Renommage en userId...';
                  ALTER TABLE notifications RENAME COLUMN user_id TO userId;
              ELSEIF EXISTS (
                  SELECT 1
                  FROM information_schema.columns
                  WHERE table_name = 'notifications' AND column_name = 'userid'
              ) THEN
                  RAISE NOTICE 'La colonne userid existe. Renommage en userId...';
                  ALTER TABLE notifications RENAME COLUMN userid TO userId;
              ELSE
                  RAISE NOTICE 'Aucune colonne user_id trouvée. Ajout de la colonne userId...';
                  ALTER TABLE notifications ADD COLUMN userId UUID REFERENCES auth.users(id) ON DELETE CASCADE;
              END IF;
          ELSE
              RAISE NOTICE 'La colonne userId existe déjà dans la table notifications.';
          END IF;
      END $$;

      -- Mise à jour des politiques RLS pour utiliser userId
      DO $$
      BEGIN
          IF EXISTS (
              SELECT 1
              FROM pg_policies
              WHERE schemaname = 'public' AND tablename = 'notifications'
          ) THEN
              -- Suppression des politiques existantes
              DROP POLICY IF EXISTS "Utilisateurs peuvent lire leurs propres notifications" ON notifications;
              DROP POLICY IF EXISTS "Utilisateurs peuvent mettre à jour leurs propres notifications" ON notifications;
              DROP POLICY IF EXISTS "Utilisateurs peuvent supprimer leurs propres notifications" ON notifications;

              -- Création des nouvelles politiques avec userId
              CREATE POLICY "Utilisateurs peuvent lire leurs propres notifications"
              ON notifications FOR SELECT
              USING (auth.uid() = userId);

              CREATE POLICY "Utilisateurs peuvent mettre à jour leurs propres notifications"
              ON notifications FOR UPDATE
              USING (auth.uid() = userId)
              WITH CHECK (auth.uid() = userId);

              CREATE POLICY "Utilisateurs peuvent supprimer leurs propres notifications"
              ON notifications FOR DELETE
              USING (auth.uid() = userId);

              RAISE NOTICE 'Politiques RLS mises à jour pour utiliser userId.';
          END IF;
      END $$;
    `;

    // Exécuter le script via Supabase
    const { data, error } = await supabase
      .rpc('execute_sql_script', { script })
      .catch(() => {
        return { data: null, error: { message: "Direct SQL execution not supported via RPC" } };
      });

    if (error) {
      console.error("Erreur lors de l'exécution du script SQL:", error.message);
      console.log("Utilisez l'interface Supabase ou un client PostgreSQL pour exécuter manuellement le script suivant :");
      console.log("----------------------------------------");
      console.log(script);
      console.log("----------------------------------------");
    } else {
      console.log("Script exécuté avec succès.");
    }
  } catch (error) {
    console.error("Erreur inattendue:", error.message);
  }
}

fixNotificationsColumn();