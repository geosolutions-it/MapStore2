/*GS_ATTRUBUTE*/
ALTER TABLE GS_ATTRIBUTE ALTER COLUMN DATE RENAME TO ATTRIBUTE_DATE;
ALTER TABLE GS_ATTRIBUTE ALTER COLUMN NUMBER RENAME TO ATTRIBUTE_NUMBER;
ALTER TABLE GS_ATTRIBUTE ALTER COLUMN STRING RENAME TO ATTRIBUTE_TEXT;
ALTER TABLE GS_ATTRIBUTE ALTER COLUMN TYPE RENAME TO ATTRIBUTE_TYPE;

create index idx_attribute_text on gs_attribute (attribute_text);
create index idx_attribute_type on gs_attribute (attribute_type);
create index idx_attribute_date on gs_attribute (attribute_date);
create index idx_attribute_number on gs_attribute (attribute_number);

/*GS_RESOURCE*/
ALTER TABLE GS_RESOURCE ADD CONSTRAINT NAME_UNIQUE UNIQUE(NAME);

/*GS_STORED_DATA*/
ALTER TABLE GS_STORED_DATA ALTER COLUMN DATA RENAME TO STORED_DATA;

/*GS_USER*/
ALTER TABLE GS_USER ALTER COLUMN ROLE RENAME TO USER_ROLE;

create index idx_user_role on gs_user (user_role);