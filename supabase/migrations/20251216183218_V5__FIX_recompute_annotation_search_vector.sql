drop function if exists public.recompute_annotation_search_vector(uuid);
create or replace function public.recompute_annotation_search_vector(p_annotation_id uuid)
returns void as $$
declare
    cites_text text;
begin
    select string_agg(coalesce(ra.cite, ''), ' ')
    into cites_text
    from public.reference_annotation ra
    where ra.annotation_id = p_annotation_id;

    update public.annotation a
    set search_vector = 
        setweight(to_tsvector('spanish', coalesce(a.title, '')), 'A') ||
        setweight(to_tsvector('spanish', coalesce(a.content, '')), 'B') ||
        setweight(to_tsvector('spanish', coalesce(cites_text, '')), 'B'),
        updated_at = now()
    where a.id = p_annotation_id;
end;
$$ language plpgsql;
