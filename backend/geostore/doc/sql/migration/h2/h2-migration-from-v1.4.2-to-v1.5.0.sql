-- Update the geostore database from 1.4.2 model to 1.5.0
-- It adds fields to gs_security for external authorization
-- It aligns the model to the schema

-- The script assumes that the tables are located into the schema called "geostore" 
--      if you put geostore in a different schema, please edit the following search_path.
SET search_path TO geostore, public;

-- Tested only with postgres9.1

-- Run the script with an unprivileged application user allowed to work on schema geostore

alter table gs_security add column username varchar(255);
alter table gs_security add column groupname varchar(255);

create index idx_security_username on gs_security (username);

create index idx_security_groupname on gs_security (groupname);