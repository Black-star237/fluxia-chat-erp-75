-- Politiques RLS pour la table invoices
-- Permettre aux utilisateurs authentifiés d'ajouter et d'accéder aux factures des entreprises dont ils sont membres

-- Activer RLS sur la table invoices
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Politique pour l'insertion
CREATE POLICY "invoices_company_members_insert"
ON invoices
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM company_members
    WHERE company_members.user_id = auth.uid()
    AND company_members.company_id = company_id
  )
);

-- Politique pour la sélection
CREATE POLICY "invoices_company_members_select"
ON invoices
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM company_members
    WHERE company_members.user_id = auth.uid()
    AND company_members.company_id = company_id
  )
);

-- Politique pour la mise à jour
CREATE POLICY "invoices_company_members_update"
ON invoices
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM company_members
    WHERE company_members.user_id = auth.uid()
    AND company_members.company_id = company_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM company_members
    WHERE company_members.user_id = auth.uid()
    AND company_members.company_id = company_id
  )
);

-- Politique pour la suppression
CREATE POLICY "invoices_company_members_delete"
ON invoices
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM company_members
    WHERE company_members.user_id = auth.uid()
    AND company_members.company_id = company_id
  )
);

-- Politiques RLS pour la table sale_items
-- Permettre aux utilisateurs authentifiés d'ajouter et d'accéder aux articles de vente des entreprises dont ils sont membres

-- Activer RLS sur la table sale_items
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;

-- Politique pour l'insertion
CREATE POLICY "sale_items_company_members_insert"
ON sale_items
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM company_members
    WHERE company_members.user_id = auth.uid()
    AND company_members.company_id = (
      SELECT company_id
      FROM sales
      WHERE sales.id = sale_id
    )
  )
);

-- Politique pour la sélection
CREATE POLICY "sale_items_company_members_select"
ON sale_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM company_members
    WHERE company_members.user_id = auth.uid()
    AND company_members.company_id = (
      SELECT company_id
      FROM sales
      WHERE sales.id = sale_id
    )
  )
);

-- Politique pour la mise à jour
CREATE POLICY "sale_items_company_members_update"
ON sale_items
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM company_members
    WHERE company_members.user_id = auth.uid()
    AND company_members.company_id = (
      SELECT company_id
      FROM sales
      WHERE sales.id = sale_id
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM company_members
    WHERE company_members.user_id = auth.uid()
    AND company_members.company_id = (
      SELECT company_id
      FROM sales
      WHERE sales.id = sale_id
    )
  )
);

-- Politique pour la suppression
CREATE POLICY "sale_items_company_members_delete"
ON sale_items
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM company_members
    WHERE company_members.user_id = auth.uid()
    AND company_members.company_id = (
      SELECT company_id
      FROM sales
      WHERE sales.id = sale_id
    )
  )
);

-- Politiques RLS pour la table products
-- Permettre aux utilisateurs authentifiés de mettre à jour le stock des produits des entreprises dont ils sont membres

-- Activer RLS sur la table products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Politique pour la mise à jour du stock uniquement
CREATE POLICY "products_update_stock_company_members"
ON products
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM company_members
    WHERE company_members.user_id = auth.uid()
    AND company_members.company_id = company_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM company_members
    WHERE company_members.user_id = auth.uid()
    AND company_members.company_id = company_id
  )
);

-- Politique pour la sélection des produits
CREATE POLICY "products_select_company_members"
ON products
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM company_members
    WHERE company_members.user_id = auth.uid()
    AND company_members.company_id = company_id
  )
);

-- Politiques RLS pour la table inventory_alerts
-- Permettre aux utilisateurs authentifiés d'ajouter et de gérer les alertes d'inventaire des entreprises dont ils sont membres

-- Activer RLS sur la table inventory_alerts
ALTER TABLE inventory_alerts ENABLE ROW LEVEL SECURITY;

-- Politique pour l'insertion
CREATE POLICY "inventory_alerts_company_members_insert"
ON inventory_alerts
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM company_members
    WHERE company_members.user_id = auth.uid()
    AND company_members.company_id = company_id
  )
);

-- Politique pour la sélection
CREATE POLICY "inventory_alerts_company_members_select"
ON inventory_alerts
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM company_members
    WHERE company_members.user_id = auth.uid()
    AND company_members.company_id = company_id
  )
);

-- Politique pour la mise à jour
CREATE POLICY "inventory_alerts_company_members_update"
ON inventory_alerts
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM company_members
    WHERE company_members.user_id = auth.uid()
    AND company_members.company_id = company_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM company_members
    WHERE company_members.user_id = auth.uid()
    AND company_members.company_id = company_id
  )
);