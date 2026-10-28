ALTER TABLE geostore.gs_resource
    ADD stored_data_id NUMBER(19,0);

UPDATE geostore.gs_resource r
SET stored_data_id = (
    SELECT sd.id
    FROM geostore.gs_stored_data sd
    WHERE sd.resource_id = r.id
)
WHERE EXISTS (
    SELECT 1
    FROM geostore.gs_stored_data sd
    WHERE sd.resource_id = r.id
);

ALTER TABLE geostore.gs_resource
    ADD CONSTRAINT gs_resource_stored_data_id_key
        UNIQUE (stored_data_id);

ALTER TABLE geostore.gs_resource
    ADD CONSTRAINT fk_resource_stored_data
        FOREIGN KEY (stored_data_id)
        REFERENCES geostore.gs_stored_data (id);

ALTER TABLE geostore.gs_stored_data
    DROP COLUMN resource_id CASCADE CONSTRAINTS;
