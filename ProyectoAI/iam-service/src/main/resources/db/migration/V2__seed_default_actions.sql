-- Flyway Migration V2: Seed Default Actions
-- Author: Phase B Remediation (2026-02-23)
-- Description: Inserts default CRUD actions for IAM system

-- Note: Using MERGE for H2 compatibility (used in tests)
-- For Postgres production, this becomes INSERT ... ON CONFLICT
MERGE INTO iam_action (id, name, description, created_at, version) KEY (id)
VALUES
    ('a7e3bb68-52c6-47b2-841c-fb23dc706e2e', 'CREATE', 'Create new entities', CURRENT_TIMESTAMP, 0),
    ('b39a3f27-6119-48e0-bb15-0d046f827471', 'READ', 'Read/view entities', CURRENT_TIMESTAMP, 0),
    ('c02e1c9e-5e3a-4424-b153-f725a3068db0', 'UPDATE', 'Update existing entities', CURRENT_TIMESTAMP, 0),
    ('d9433431-7e56-4cf7-9a03-7ad6ab6ea1a9', 'DELETE', 'Delete entities', CURRENT_TIMESTAMP, 0),
    ('e16b9cb8-b0fa-4f9b-980b-df0ad87bb517', 'EXECUTE', 'Execute operations/actions', CURRENT_TIMESTAMP, 0);
