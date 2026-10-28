-- Update the geostore database from 1.2 model to 1.4.2
-- It increases the stored data size
-- It aligns the model to the schema

-- The script assumes that the tables are located into the schema called "geostore" 
--      if you put geostore in a different schema, please edit the following search_path.
SET search_path TO geostore, public;

-- Tested only with postgres9.1

-- Run the script with an unprivileged application user allowed to work on schema geostore

alter table gs_stored_data alter column stored_data TYPE varchar(10000000);
alter table gs_resource alter column description TYPE varchar(10000);

