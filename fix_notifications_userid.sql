-- Vérifier si la colonne "userid" existe et la renommer en "userId"
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'notifications' AND column_name = 'userid'
    ) THEN
        RAISE NOTICE 'La colonne userid existe. Renommage en userId...';
        ALTER TABLE notifications RENAME COLUMN userid TO userId;
    ELSE
        RAISE NOTICE 'La colonne userid n''existe pas. Aucune action nécessaire.';
    END IF;
END;
$$;

-- Vérifier si la colonne "userId" existe maintenant
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'notifications' AND column_name = 'userId'
    ) THEN
        RAISE NOTICE 'La colonne userId existe. Tout est en ordre.';
    ELSE
        RAISE EXCEPTION 'La colonne userId n''existe toujours pas. Il peut y avoir un problème avec la table notifications.';
    END IF;
END;
$$;