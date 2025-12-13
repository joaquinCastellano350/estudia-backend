DO $$
BEGIN
    DROP TABLE IF EXISTS public.document_chunk;
    DROP INDEX IF EXISTS document_chunk_document_idx;
    DROP INDEX IF EXISTS document_chunk_embedding_idx;
    
    alter table public.document drop column if exists processing_status;
    alter table public.document add column if not exists updated_at timestamptz not null default now();
    alter table public.document alter column visibility drop default;
    alter table public.document alter column visibility type visibility_enum using (visibility::visibility_enum);
    alter table public.document alter column visibility set default 'PRIVATE'::visibility_enum;

    create table if not exists public.annotation (
        id uuid primary key default gen_random_uuid(),
        document_id uuid references public.document(id),
        user_id uuid references public."user"(id),
        title text,
        content text,
        kind annotation_kind_enum not null default 'NOTE',
        visibility visibility_enum not null default 'PRIVATE',
        tags text[],
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
    );
    create index if not exists annotation_document_idx on public.annotation(document_id);
    create index if not exists annotation_user_idx on public.annotation(user_id);

    create table if not exists public.shared_annotation (
        id uuid primary key default gen_random_uuid(),
        annotation_id uuid not null references public.annotation(id) on delete cascade,
        owner_id uuid references public."user"(id) on delete cascade,
        target_user uuid references public."user"(id) on delete cascade,
        permission shared_annotation_permission_enum not null default 'READ',
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
    );
    create index if not exists shared_annotation_target_user_idx on public.shared_annotation(target_user);
    create index if not exists shared_annotation_owner_id_idx on public.shared_annotation(owner_id);


    create table if not exists public.reference_annotation (
        id uuid primary key default gen_random_uuid(),
        annotation_id uuid not null references public.annotation(id) on delete cascade,
        page integer,
        cite text,
        coordinates jsonb,
        created_at timestamptz not null default now()
    );
    create index if not exists reference_annotation_annotation_idx on public.reference_annotation(annotation_id);

    create table if not exists public.resource (
        id uuid primary key default gen_random_uuid(),
        document_id uuid references public.document(id) on delete cascade,
        annotation_id uuid references public.annotation(id) on delete cascade,
        user_id uuid references public."user"(id),
        type resource_type_enum not null,
        storage_path text,
        external_url text,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
    );
    create index if not exists resource_document_idx on public.resource(document_id);
    create index if not exists resource_annotation_idx on public.resource(annotation_id);
    create index if not exists resource_user_idx on public.resource(user_id);

END $$;