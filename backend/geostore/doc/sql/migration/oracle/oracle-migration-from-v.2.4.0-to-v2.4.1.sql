ALTER TABLE geostore.gs_user_favorites
DROP
CONSTRAINT gs_user_favorites_pkey;

ALTER TABLE geostore.gs_user_favorites
    MODIFY user_id NUMBER NULL;

ALTER TABLE geostore.gs_user_favorites
    ADD id NUMBER;

CREATE SEQUENCE geostore.gs_user_favorites_id_seq
    START WITH 1
    INCREMENT BY 1
    NOCACHE;

UPDATE geostore.gs_user_favorites
SET id = geostore.gs_user_favorites_id_seq.NEXTVAL;

ALTER TABLE geostore.gs_user_favorites
    MODIFY id NUMBER NOT NULL;

ALTER TABLE geostore.gs_user_favorites
    ADD CONSTRAINT gs_user_favorites_pk PRIMARY KEY (id);

CREATE
OR REPLACE TRIGGER geostore.gs_user_favorites_bi
BEFORE INSERT ON geostore.gs_user_favorites
FOR EACH ROW
BEGIN
  IF
:NEW.id IS NULL THEN
SELECT geostore.gs_user_favorites_id_seq.NEXTVAL
INTO :NEW.id
FROM dual;
END IF;
END;
/

ALTER TABLE geostore.gs_user_favorites
    ADD username VARCHAR2(255);

ALTER TABLE geostore.gs_user_favorites
    ADD CONSTRAINT gs_user_favorites_unique_user_id
        UNIQUE (user_id, resource_id);

ALTER TABLE geostore.gs_user_favorites
    ADD CONSTRAINT gs_user_favorites_unique_username
        UNIQUE (resource_id, username);

ALTER TABLE geostore.gs_user_favorites
    ADD CONSTRAINT gs_user_favorites_check
        CHECK (
            (user_id IS NOT NULL AND username IS NULL)
                OR
            (user_id IS NULL AND username IS NOT NULL)
            );