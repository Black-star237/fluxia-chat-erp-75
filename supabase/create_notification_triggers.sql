CREATE OR REPLACE FUNCTION handle_new_sale()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (type, title, description, userId, companyId, priority)
  VALUES (
    'sale',
    'Nouvelle vente enregistrée',
    'Une nouvelle vente a été effectuée pour un montant de ' || NEW.total_amount || ' FCFA.',
    NEW.sold_by,
    NEW.company_id,
    'high'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER new_sale_notification
AFTER INSERT ON sales
FOR EACH ROW
EXECUTE FUNCTION handle_new_sale();