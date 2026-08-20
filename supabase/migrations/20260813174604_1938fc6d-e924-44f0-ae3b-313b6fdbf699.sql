-- ParsianYar baseline schema copied from the current Lovable project.
-- See the Lovable project for the complete source of this migration.
-- Core entities: profiles, user_roles, companies, company_members,
-- documents, analysis_runs, ai_interactions, commerce, tickets and content.

create type public.app_role as enum ('guest','free_user','customer','ceo','finance_manager','admin_manager','accountant','tax_specialist','insurance_specialist','auditor','super_admin');
create table public.profiles (id uuid primary key default gen_random_uuid(), user_id uuid not null unique, full_name text, phone text, company_name text, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.user_roles (id uuid primary key default gen_random_uuid(), user_id uuid not null, role public.app_role not null, created_at timestamptz not null default now(), unique(user_id, role));
create table public.companies (id uuid primary key default gen_random_uuid(), owner_id uuid not null, name text not null, business_type text not null default 'services', national_id text, economic_code text, employees_count integer, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.company_members (id uuid primary key default gen_random_uuid(), company_id uuid not null references public.companies(id) on delete cascade, user_id uuid not null, role public.app_role not null default 'accountant', invited_email text, accepted_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(company_id,user_id));
create or replace function public.has_role(_user_id uuid,_role public.app_role) returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from public.user_roles where user_id=_user_id and role=_role) $$;
create or replace function public.is_company_member(_company_id uuid,_user_id uuid) returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from public.companies c where c.id=_company_id and c.owner_id=_user_id) or exists(select 1 from public.company_members m where m.company_id=_company_id and m.user_id=_user_id) $$;

create table public.documents (id uuid primary key default gen_random_uuid(), user_id uuid not null, company_id uuid references public.companies(id) on delete cascade, title text not null, kind text not null default 'other', storage_bucket text not null default 'customer-documents', storage_path text, size_kb integer, status text not null default 'uploaded', reviewed_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.analysis_runs (id uuid primary key default gen_random_uuid(), user_id uuid not null, company_id uuid references public.companies(id) on delete cascade, kind text not null default 'mini_diagnosis', status text not null default 'queued', health_score integer, result jsonb not null default '{}'::jsonb, source_document_id uuid references public.documents(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create type public.confidence_level as enum ('high','medium','needs_review');
create table public.ai_interactions (id uuid primary key default gen_random_uuid(), user_id uuid not null, company_id uuid references public.companies(id) on delete cascade, agent text not null default 'orchestrator', question text not null, answer text, confidence public.confidence_level not null default 'medium', sources jsonb not null default '[]'::jsonb, tokens_used integer, created_at timestamptz not null default now());

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.companies enable row level security;
alter table public.company_members enable row level security;
alter table public.documents enable row level security;
alter table public.analysis_runs enable row level security;
alter table public.ai_interactions enable row level security;
create policy profiles_select_own on public.profiles for select to authenticated using(auth.uid()=user_id);
create policy profiles_insert_own on public.profiles for insert to authenticated with check(auth.uid()=user_id);
create policy profiles_update_own on public.profiles for update to authenticated using(auth.uid()=user_id) with check(auth.uid()=user_id);
create policy roles_select_own on public.user_roles for select to authenticated using(auth.uid()=user_id);
create policy companies_member_read on public.companies for select to authenticated using(owner_id=auth.uid() or public.is_company_member(id,auth.uid()));
create policy companies_insert_own on public.companies for insert to authenticated with check(owner_id=auth.uid());
create policy companies_owner_update on public.companies for update to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid());
create policy companies_owner_delete on public.companies for delete to authenticated using(owner_id=auth.uid());
create policy members_read_scoped on public.company_members for select to authenticated using(user_id=auth.uid() or public.is_company_member(company_id,auth.uid()));
create policy members_owner_write on public.company_members for all to authenticated using(exists(select 1 from public.companies c where c.id=company_id and c.owner_id=auth.uid())) with check(exists(select 1 from public.companies c where c.id=company_id and c.owner_id=auth.uid()));
create policy documents_select_scoped on public.documents for select to authenticated using(user_id=auth.uid() or (company_id is not null and public.is_company_member(company_id,auth.uid())));
create policy documents_insert_own on public.documents for insert to authenticated with check(user_id=auth.uid());
create policy analysis_select_scoped on public.analysis_runs for select to authenticated using(user_id=auth.uid() or (company_id is not null and public.is_company_member(company_id,auth.uid())));
create policy analysis_insert_own on public.analysis_runs for insert to authenticated with check(user_id=auth.uid());
create policy ai_select_scoped on public.ai_interactions for select to authenticated using(user_id=auth.uid() or (company_id is not null and public.is_company_member(company_id,auth.uid())));
create policy ai_insert_own on public.ai_interactions for insert to authenticated with check(user_id=auth.uid());
