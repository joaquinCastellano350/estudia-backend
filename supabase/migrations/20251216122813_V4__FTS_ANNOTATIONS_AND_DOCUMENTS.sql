
-- FTS FOT ANNOTATIONS --
alter table public.annotation add column if not exists search_vector tsvector;

create index if not exists annotation_search_vector_gin on public.annotation using gin (search_vector);

create or replace function public.recompute_annotation_search_vector(annotation_id uuid)
returns void as $$
declare
    cites_text text;
begin
    select string_agg(coalesce(ra.cite, ''), ' ')
    into cites_text
    from public.reference_annotation ra
    where ra.annotation_id = annotation_id;

    update public.annotation a
    set search_vector = 
        setweight(to_tsvector('spanish', coalesce(a.title, '')), 'A') ||
        setweight(to_tsvector('spanish', coalesce(a.content, '')), 'B') ||
        setweight(to_tsvector('spanish', coalesce(cites_text, '')), 'B'),
        updated_at = now()
    where a.id = annotation_id;
end;
$$ language plpgsql;

create or replace function public.annotation_search_vector_trigger()
returns trigger as $$
begin
    perform public.recompute_annotation_search_vector(new.id);
    return new;
end;
$$ language plpgsql;
drop trigger if exists trg_annotation_search_vector on public.annotation;
create trigger trg_annotation_search_vector
after insert or update of title, content on public.annotation
for each row execute function public.annotation_search_vector_trigger();

create or replace function public.reference_annotation_search_vector_trigger()
returns trigger as $$
begin
    if TG_OP = 'INSERT' or TG_OP = 'UPDATE' then
        perform public.recompute_annotation_search_vector(new.annotation_id);
        return new;
    elsif TG_OP = 'DELETE' then
        perform public.recompute_annotation_search_vector(old.annotation_id);
        return old;
    end if;
    return null;
end;
$$ language plpgsql;
drop trigger if exists trg_reference_annotation_search_vector on public.reference_annotation;
create trigger trg_reference_annotation_search_vector
after insert or update of cite or delete on public.reference_annotation
for each row execute function public.reference_annotation_search_vector_trigger();

-- FTS FOR DOCUMENTS --
alter table public.document add column if not exists search_vector tsvector;
create index if not exists document_search_vector_gin on public.document using gin (search_vector);
create or replace function public.document_search_vector_trigger()
returns trigger as $$
begin
    new.search_vector :=
        setweight(to_tsvector('spanish', coalesce(new.name, '')), 'A') ||
        setweight(to_tsvector('spanish', coalesce(new.description, '')), 'B');
    return new;
end;
$$ language plpgsql;
drop trigger if exists trg_document_search_vector on public.document;
create trigger trg_document_search_vector
before insert or update of name, description on public.document
for each row execute function public.document_search_vector_trigger();

