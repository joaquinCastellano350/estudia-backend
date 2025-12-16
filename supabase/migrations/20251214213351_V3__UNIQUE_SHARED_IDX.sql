create index if not exists shared_annotation_unique_idx on public.shared_annotation (annotation_id, target_user);
alter table public.shared_annotation
  add constraint shared_annotation_annotation_target_unique
  unique (annotation_id, target_user);