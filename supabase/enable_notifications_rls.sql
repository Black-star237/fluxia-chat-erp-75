-- Activer les politiques RLS pour la table notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux utilisateurs de lire leurs propres notifications
CREATE POLICY "Users can read their own notifications"
ON notifications
FOR SELECT
USING (auth.uid() = userId);