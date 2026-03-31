create extension if not exists vector;

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  file_name text not null,
  storage_path text not null unique,
  status text not null default 'processing' check (status in ('processing', 'ready', 'failed')),
  summary text,
  key_points text[],
  quiz jsonb,
  excerpt text,
  page_count integer,
  word_count integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.document_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  chunk_index integer not null,
  content text not null,
  page_number integer,
  token_count integer,
  embedding vector(768),
  created_at timestamptz not null default now()
);

create table if not exists public.chats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  document_id uuid not null references public.documents(id) on delete cascade,
  title text not null,
  last_message_preview text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.chats(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  sources jsonb,
  created_at timestamptz not null default now()
);

create index if not exists documents_user_id_idx on public.documents (user_id, updated_at desc);
create index if not exists chats_user_id_idx on public.chats (user_id, updated_at desc);
create index if not exists messages_chat_id_idx on public.messages (chat_id, created_at);
create index if not exists document_chunks_document_idx on public.document_chunks (document_id, chunk_index);
create index if not exists document_chunks_embedding_idx
  on public.document_chunks
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists documents_set_updated_at on public.documents;
create trigger documents_set_updated_at
before update on public.documents
for each row
execute function public.set_updated_at();

drop trigger if exists chats_set_updated_at on public.chats;
create trigger chats_set_updated_at
before update on public.chats
for each row
execute function public.set_updated_at();

alter table public.documents enable row level security;
alter table public.document_chunks enable row level security;
alter table public.chats enable row level security;
alter table public.messages enable row level security;

create policy "Users can manage their own documents"
on public.documents
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can manage their own chats"
on public.chats
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can manage document chunks for owned documents"
on public.document_chunks
for all
to authenticated
using (
  exists (
    select 1
    from public.documents
    where documents.id = document_chunks.document_id
      and documents.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.documents
    where documents.id = document_chunks.document_id
      and documents.user_id = auth.uid()
  )
);

create policy "Users can manage messages for owned chats"
on public.messages
for all
to authenticated
using (
  exists (
    select 1
    from public.chats
    where chats.id = messages.chat_id
      and chats.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.chats
    where chats.id = messages.chat_id
      and chats.user_id = auth.uid()
  )
);

insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

create policy "Users can read their own PDFs"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'documents'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can upload their own PDFs"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'documents'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can update their own PDFs"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'documents'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'documents'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can delete their own PDFs"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'documents'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create or replace function public.match_document_chunks(
  filter_document_id uuid,
  query_embedding vector(768),
  match_count integer default 6
)
returns table (
  id uuid,
  chunk_index integer,
  content text,
  page_number integer,
  similarity real
)
language sql
stable
set search_path = public
as $$
  select
    document_chunks.id,
    document_chunks.chunk_index,
    document_chunks.content,
    document_chunks.page_number,
    1 - (document_chunks.embedding <=> query_embedding) as similarity
  from public.document_chunks
  where document_chunks.document_id = filter_document_id
  order by document_chunks.embedding <=> query_embedding
  limit greatest(match_count, 1);
$$;
