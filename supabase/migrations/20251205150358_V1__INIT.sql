-- USERS
create table public."user" (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  lastname text not null,
  email text not null unique,
  hashed_password text not null,
  created_at timestamptz not null default now()
);

-- FOLDERS
create table public.folder (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public."user"(id) on delete cascade,
  parent_id uuid references public.folder(id) on delete set null,
  visibility text not null default 'PRIVATE', -- PRIVATE | PROTECTED | PUBLIC
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- DOCUMENTS
create table public.document (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public."user"(id) on delete cascade,
  folder_id uuid references public.folder(id) on delete set null,
  name text not null,
  description text,
  storage_key text not null,         
  share_token text,                  
  share_token_expires_at timestamptz,
  visibility text not null default 'PRIVATE', -- PRIVATE | PROTECTED | PUBLIC
  mime_type text not null,
  size_bytes bigint not null,
  processing_status text not null default 'PENDING', -- PENDING | PROCESSING | DONE | FAILED
  created_at timestamptz not null default now()
);

-- DOCUMENT CHUNKS
create table public.document_chunk (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.document(id) on delete cascade,
  chunk_index integer not null,
  content text not null,
  metadata jsonb,
  embedding extensions.vector(1536),              -- text-embedding-3-small OpenAI -> actualizable
  created_at timestamptz not null default now()
);

create index document_chunk_document_idx on public.document_chunk(document_id);
create index document_chunk_embedding_idx on public.document_chunk
  using ivfflat (embedding extensions.vector_cosine_ops)
  with (lists = 100);

-- CHATS
create table public.chat (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public."user"(id) on delete cascade,
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- CHAT CONTEXT
create table public.chat_context (
  chat_id uuid primary key references public.chat(id) on delete cascade,
  document_id uuid references public.document(id) on delete cascade,
  folder_id uuid references public.folder(id) on delete cascade
);

-- MESSAGES
create table public.message (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.chat(id) on delete cascade,
  role text not null,                    -- USER | ASSISTANT | SYSTEM
  content text not null,
  created_at timestamptz not null default now()
);
