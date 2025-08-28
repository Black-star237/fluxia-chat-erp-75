-- Création des types ENUM
CREATE TYPE notification_type AS ENUM ('sale', 'stock', 'system', 'alert');
CREATE TYPE notification_priority AS ENUM ('low', 'medium', 'high');

-- Création de la table notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  read BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  userId UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  companyId UUID REFERENCES companies(id) ON DELETE CASCADE,
  priority notification_priority DEFAULT 'medium',
  metadata JSONB
);

-- Activation de RLS sur la table notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux utilisateurs de lire uniquement leurs propres notifications
CREATE POLICY "Utilisateurs peuvent lire leurs propres notifications"
ON notifications FOR SELECT
USING (auth.uid() = userId);

-- Politique pour permettre aux utilisateurs de mettre à jour uniquement leurs propres notifications
CREATE POLICY "Utilisateurs peuvent mettre à jour leurs propres notifications"
ON notifications FOR UPDATE
USING (auth.uid() = userId)
WITH CHECK (auth.uid() = userId);

-- Politique pour permettre aux utilisateurs de supprimer uniquement leurs propres notifications
CREATE POLICY "Utilisateurs peuvent supprimer leurs propres notifications"
ON notifications FOR DELETE
USING (auth.uid() = userId);

-- Création de la fonction et du déclencheur pour les nouvelles ventes
CREATE OR REPLACE FUNCTION handle_new_sale()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (type, title, description, userId, companyId, priority)
  VALUES (
    'sale'::notification_type,
    'Nouvelle vente enregistrée',
    'Une nouvelle vente a été effectuée pour un montant de ' || NEW.total_amount || ' FCFA.',
    NEW.sold_by,
    NEW.company_id,
    'high'::notification_priority
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER IF NOT EXISTS new_sale_notification
AFTER INSERT ON sales
FOR EACH ROW
EXECUTE FUNCTION handle_new_sale();
-- Fonction et déclencheur pour l'ajout de produit
CREATE OR REPLACE FUNCTION handle_new_product()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (type, title, description, userId, companyId, priority)
  VALUES (
    'stock'::notification_type,
    'Nouveau produit ajouté',
    'Un nouveau produit a été ajouté : ' || NEW.name,
    NEW.created_by,
    NEW.company_id,
    'medium'::notification_priority
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER new_product_notification
AFTER INSERT ON products
FOR EACH ROW
EXECUTE FUNCTION handle_new_product();

-- Fonction et déclencheur pour l'ajout de client
CREATE OR REPLACE FUNCTION handle_new_client()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (type, title, description, userId, companyId, priority)
  VALUES (
    'system'::notification_type,
    'Nouveau client ajouté',
    'Un nouveau client a été ajouté : ' || NEW.name,
    NEW.created_by,
    NEW.company_id,
    'medium'::notification_priority
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER new_client_notification
AFTER INSERT ON clients
FOR EACH ROW
EXECUTE FUNCTION handle_new_client();

-- Fonction et déclencheur pour les stocks bas
CREATE OR REPLACE FUNCTION handle_low_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.quantity <= NEW.low_stock_threshold THEN
    INSERT INTO notifications (type, title, description, userId, companyId, priority)
    VALUES (
      'alert'::notification_type,
      'Stock bas',
      'Le stock du produit ' || NEW.name || ' est bas. Quantité actuelle : ' || NEW.quantity,
      NEW.created_by,
      NEW.company_id,
      'high'::notification_priority
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER low_stock_notification
AFTER UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION handle_low_stock();