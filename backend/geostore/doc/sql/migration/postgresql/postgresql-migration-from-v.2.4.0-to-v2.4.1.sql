ALTER TABLE geostore.gs_user_favorites
    DROP CONSTRAINT gs_user_favorites_pkey;

ALTER TABLE geostore.gs_user_favorites
    ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE geostore.gs_user_favorites
    ADD COLUMN id int8;

CREATE SEQUENCE geostore.gs_user_favorites_id_seq
    START WITH 1
    INCREMENT BY 1
    OWNED BY geostore.gs_user_favorites.id;

UPDATE geostore.gs_user_favorites
SET id = nextval('geostore.gs_user_favorites_id_seq');

ALTER TABLE geostore.gs_user_favorites
    ALTER COLUMN id SET NOT NULL;

ALTER TABLE geostore.gs_user_favorites
    ADD CONSTRAINT gs_user_favorites_pk PRIMARY KEY (id);

ALTER TABLE geostore.gs_user_favorites
    ALTER COLUMN id SET DEFAULT nextval('geostore.gs_user_favorites_id_seq');

ALTER TABLE geostore.gs_user_favorites
    ADD COLUMN username varchar NULL;

ALTER TABLE geostore.gs_user_favorites
    ADD CONSTRAINT gs_user_favorites_unique_user_id
        UNIQUE (user_id, resource_id);

ALTER TABLE geostore.gs_user_favorites
    ADD CONSTRAINT gs_user_favorites_unique_username
        UNIQUE (resource_id, username);

ALTER TABLE geostore.gs_user_favorites
    ADD CONSTRAINT gs_user_favorites_check
        CHECK ((
                (user_id IS NOT NULL AND username IS NULL)
                    OR
                (user_id IS NULL AND username IS NOT NULL)
                ));