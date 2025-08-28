-- Fonction pour insérer automatiquement les articles de vente dans sale_items
CREATE OR REPLACE FUNCTION insert_sale_items_after_sale()
RETURNS TRIGGER AS $$
BEGIN
  -- Insérer les articles de vente associés
  INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, line_total)
  SELECT
    NEW.id,
    item->>'product_id' AS product_id,
    (item->>'quantity')::integer AS quantity,
    (item->>'unit_price')::numeric AS unit_price,
    (item->>'line_total')::numeric AS line_total
  FROM jsonb_array_elements(NEW.sale_items::jsonb) AS item;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour insérer automatiquement une facture dans invoices
CREATE OR REPLACE FUNCTION insert_invoice_after_sale()
RETURNS TRIGGER AS $$
BEGIN
  -- Insérer une facture associée à la vente
  INSERT INTO invoices (
    invoice_number,
    sale_id,
    client_id,
    company_id,
    issue_date,
    due_date,
    subtotal,
    tax_amount,
    total_amount,
    status,
    paid_amount,
    notes
  )
  VALUES (
    'INV-' || EXTRACT(EPOCH FROM NOW()),
    NEW.id,
    NEW.client_id,
    NEW.company_id,
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '30 days',
    NEW.subtotal,
    NEW.tax_amount,
    NEW.total_amount,
    CASE WHEN NEW.status = 'completed' THEN 'paid'::invoice_status ELSE 'sent'::invoice_status END,
    CASE WHEN NEW.status = 'completed' THEN NEW.total_amount ELSE 0 END,
    'Facture générée automatiquement pour la vente ' || NEW.sale_number
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer les triggers
DROP TRIGGER IF EXISTS trigger_insert_sale_items ON sales;
CREATE TRIGGER trigger_insert_sale_items
AFTER INSERT ON sales
FOR EACH ROW
EXECUTE FUNCTION insert_sale_items_after_sale();

DROP TRIGGER IF EXISTS trigger_insert_invoice ON sales;
CREATE TRIGGER trigger_insert_invoice
AFTER INSERT ON sales
FOR EACH ROW
EXECUTE FUNCTION insert_invoice_after_sale();