/*GS_ATTRUBUTE*/
ALTER TABLE gs_attribute RENAME COLUMN date TO attribute_date;
ALTER TABLE gs_attribute RENAME COLUMN number TO attribute_number;
ALTER TABLE gs_attribute RENAME COLUMN string TO attribute_text;
ALTER TABLE gs_attribute RENAME COLUMN type TO attribute_type;

create index idx_attribute_text on geostore.gs_attribute (attribute_text);
create index idx_attribute_type on geostore.gs_attribute (attribute_type);
create index idx_attribute_date on geostore.gs_attribute (attribute_date);
create index idx_attribute_number on geostore.gs_attribute (attribute_number);

/*GS_RESOURCE*/
ALTER TABLE gs_resource ADD CONSTRAINT name_unique UNIQUE(name);

/*GS_STORED_DATA*/
ALTER TABLE gs_stored_data RENAME COLUMN data TO stored_data;

/*GS_USER*/
ALTER TABLE gs_user RENAME COLUMN role TO user_role;

create index idx_user_role on gs_user (user_role);