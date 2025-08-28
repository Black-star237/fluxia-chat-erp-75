# Conception de la base de données pour les invitations et demandes d'adhésion

## Tables nécessaires

### 1. Table `invitations`

Stocke les invitations envoyées par les propriétaires ou managers pour inviter des utilisateurs à rejoindre une entreprise.

```sql
create table if not exists invitations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  invited_by uuid not null references profiles(id) on delete set null,
  invited_email varchar(255) not null,
  role app_role not null default 'employee',
  status invitation_status not null default 'pending',
  token uuid not null default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc', now()),
  updated_at timestamp with time zone default timezone('utc', now()),
  expires_at timestamp with time zone not null default timezone('utc', now() + interval '7 days')
);
```

### 2. Table `membership_requests`

Stocke les demandes d'adhésion envoyées par des utilisateurs pour rejoindre une entreprise.

```sql
create table if not exists membership_requests (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  requested_role app_role not null default 'employee',
  status request_status not null default 'pending',
  message text,
  created_at timestamp with time zone default timezone('utc', now()),
  updated_at timestamp with time zone default timezone('utc', now())
);
```

### 3. Énumérations nécessaires

```sql
-- Statuts des invitations
create type invitation_status as enum ('pending', 'accepted', 'rejected', 'expired');

-- Statuts des demandes
create type request_status as enum ('pending', 'approved', 'rejected');
```

## Relations

- Une invitation appartient à une entreprise (`company_id` référence `companies.id`)
- Une invitation est envoyée par un utilisateur (`invited_by` référence `profiles.id`)
- Une demande d'adhésion est faite par un utilisateur pour une entreprise
- Les rôles utilisent l'énumération existante `app_role`

## Index recommandés

```sql
-- Pour les invitations
create index idx_invitations_company_id on invitations(company_id);
create index idx_invitations_email on invitations(invited_email);
create index idx_invitations_token on invitations(token);
create index idx_invitations_status on invitations(status);

-- Pour les demandes
create index idx_requests_company_id on membership_requests(company_id);
create index idx_requests_user_id on membership_requests(user_id);
create index idx_requests_status on membership_requests(status);
```

## Fonctions utiles

### Fonction pour vérifier si un utilisateur peut inviter des membres

```sql
create or replace function can_invite_members(user_id uuid, company_id uuid)
returns boolean as $$
begin
  return exists (
    select 1
    from company_members
    where user_id = $1
    and company_id = $2
    and role in ('owner', 'manager')
    and is_active = true
  );
end;
$$ language plpgsql stable;
```

### Fonction pour accepter une invitation

```sql
create or replace function accept_invitation(invitation_id uuid)
returns void as $$
declare
  invitation_record record;
  company_id uuid;
  invited_email varchar(255);
  role app_role;
  user_id uuid;
begin
  -- Get invitation details
  select * into invitation_record from invitations where id = invitation_id and status = 'pending';

  if not found then
    raise exception 'Invalid or expired invitation';
  end if;

  -- Check if user exists with this email
  select id into user_id from profiles where email = invitation_record.invited_email;

  if not found then
    raise exception 'No user found with this email';
  end if;

  -- Add user to company
  insert into company_members (company_id, user_id, role, is_active, joined_at)
  values (invitation_record.company_id, user_id, invitation_record.role, true, now());

  -- Update invitation status
  update invitations
  set status = 'accepted', updated_at = now()
  where id = invitation_id;
end;
$$ language plpgsql;
```

## Sécurité

- Les invitations doivent expirer après un certain temps (7 jours par défaut)
- Seuls les propriétaires et managers peuvent inviter des membres
- Les utilisateurs ne peuvent rejoindre une entreprise que via une invitation acceptée ou une demande approuvée