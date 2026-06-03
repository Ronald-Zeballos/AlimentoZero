-- Flyway Migration V3: Add displayName and capabilities to iam_role
-- Description: Adds support for displayName (human-readable label) and
--              capabilities (JSON array of permission strings) on Role entity.

ALTER TABLE iam_role ADD COLUMN display_name VARCHAR(100);
ALTER TABLE iam_role ADD COLUMN capabilities VARCHAR(2000);
