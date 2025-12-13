DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'visibility_enum') THEN
    CREATE TYPE visibility_enum AS ENUM ('PRIVATE', 'PUBLIC', 'PUBLIC_LINK');
  END IF;
END$$;


DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'annotation_kind_enum') THEN
    CREATE TYPE annotation_kind_enum AS ENUM ('NOTE', 'HIGHLIGHT', 'QUESTION', 'TASK');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'shared_annotation_permission_enum') THEN
    CREATE TYPE shared_annotation_permission_enum AS ENUM ('READ', 'WRITE');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'resource_type_enum') THEN
    CREATE TYPE resource_type_enum AS ENUM ('IMAGE', 'LINK', 'FILE');
  END IF;
END$$;
