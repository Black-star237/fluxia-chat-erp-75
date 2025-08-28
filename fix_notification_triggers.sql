-- Supprimer les anciens triggers et fonctions

-- Supprimer le trigger pour les nouveaux produits
DROP TRIGGER IF EXISTS new_product_notification ON products;

-- Supprimer la fonction pour les nouveaux produits
DROP FUNCTION IF EXISTS handle_new_product;

-- Supprimer le trigger pour les nouveaux clients
DROP TRIGGER IF EXISTS new_client_notification ON clients;

-- Supprimer la fonction pour les nouveaux clients
DROP FUNCTION IF EXISTS handle_new_client;

-- Supprimer le trigger pour les stocks bas
DROP TRIGGER IF EXISTS low_stock_notification ON products;

-- Supprimer la fonction pour les stocks bas
DROP FUNCTION IF EXISTS handle_low_stock;

-- Supprimer le trigger pour les nouvelles ventes
DROP TRIGGER IF EXISTS new_sale_notification ON sales;

-- Supprimer la fonction pour les nouvelles ventes
DROP FUNCTION IF EXISTS handle_new_sale;

-- Créer les nouvelles fonctions et triggers avec "created_by"

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
  IF NEW.quantity <= NEW.min_stock_level THEN
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

-- Fonction et déclencheur pour les nouvelles ventes
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

CREATE TRIGGER new_sale_notification
AFTER INSERT ON sales
FOR EACH ROW
EXECUTE FUNCTION handle_new_sale();