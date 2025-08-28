-- Create invitation_status enum
create type invitation_status as enum ('pending', 'accepted', 'rejected', 'expired');

-- Create request_status enum
create type request_status as enum ('pending', 'approved', 'rejected');

-- Create invitations table
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

-- Create membership_requests table
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

-- Create indexes for performance
create index idx_invitations_company_id on invitations(company_id);
create index idx_invitations_email on invitations(invited_email);
create index idx_invitations_token on invitations(token);
create index idx_invitations_status on invitations(status);

create index idx_requests_company_id on membership_requests(company_id);
create index idx_requests_user_id on membership_requests(user_id);
create index idx_requests_status on membership_requests(status);

-- Grant permissions
alter table invitations enable row level security;
alter table membership_requests enable row level security;

create policy "invitations_can_view" on invitations
  for select
  using (
    -- User can see invitations they sent or invitations to their companies
    (auth.uid() = invited_by) or
    (exists (
      select 1
      from company_members
      where company_members.company_id = invitations.company_id
      and company_members.user_id = auth.uid()
      and company_members.role in ('owner', 'manager')
    ))
  );

create policy "invitations_can_insert" on invitations
  for insert
  with check (
    -- Only owners and managers can invite
    exists (
      select 1
      from company_members
      where company_members.company_id = NEW.company_id
      and company_members.user_id = auth.uid()
      and company_members.role in ('owner', 'manager')
    )
  );

create policy "requests_can_view" on membership_requests
  for select
  using (
    -- User can see their own requests or requests to their companies
    (auth.uid() = user_id) or
    (exists (
      select 1
      from company_members
      where company_members.company_id = membership_requests.company_id
      and company_members.user_id = auth.uid()
      and company_members.role in ('owner', 'manager')
    ))
  );

create policy "requests_can_insert" on membership_requests
  for insert
  with check (
    -- Users can request to join companies they're not already in
    not exists (
      select 1
      from company_members
      where company_members.company_id = NEW.company_id
      and company_members.user_id = auth.uid()
    )
  );