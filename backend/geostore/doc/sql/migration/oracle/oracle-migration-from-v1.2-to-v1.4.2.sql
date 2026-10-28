-- Update the geostore database from 1.2 model to 1.4.2
-- It aligns the model to the schema

-- The script assumes that the tables are located into the schema called "geostore" 
--      if not find/replace geostore. with <yourschemaname>.

-- Tested with Oracle 11g

-- Run the script with an unprivileged application user allowed to work on schema geostore

ALTER TABLE gs_resource MODIFY description VARCHAR2(10000);