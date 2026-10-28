-- ---------------------------
-- CREATE geostore SCHEMAs  
-- ---------------------------

CREATE user geostore LOGIN PASSWORD 'geostore' NOSUPERUSER INHERIT NOCREATEDB NOCREATEROLE;

CREATE SCHEMA geostore;

GRANT USAGE ON SCHEMA geostore TO geostore ;
GRANT ALL ON SCHEMA geostore TO geostore ;

CREATE user geostore_test LOGIN PASSWORD 'geostore_test' NOSUPERUSER INHERIT NOCREATEDB NOCREATEROLE;

CREATE SCHEMA geostore_test;

GRANT USAGE ON SCHEMA geostore_test TO geostore_test;
GRANT ALL ON SCHEMA geostore_test TO geostore_test;

-- ---------------------------
-- CREATE geofence SCHEMAs 
-- ---------------------------

CREATE SCHEMA geofence;

GRANT USAGE ON SCHEMA geofence TO geostore;
GRANT ALL ON SCHEMA geofence TO geostore;

GRANT SELECT ON public.spatial_ref_sys to geostore;
GRANT SELECT,INSERT,DELETE ON public.geometry_columns to geostore;


-- CREATE SCHEMA geofence_test

CREATE SCHEMA geofence_test;

GRANT USAGE ON SCHEMA geofence_test TO geostore_test;
GRANT ALL ON SCHEMA geofence_test TO geostore_test;

GRANT SELECT ON public.spatial_ref_sys to geostore_test;
GRANT SELECT,INSERT,DELETE ON public.geometry_columns to geostore_test;


-- -------------------------------------
-- -------- Set SearchPaths ------------
-- -------------------------------------

alter user geostore set search_path to geostore, geofence, public;
alter user geostore_test set search_path to geostore_test, geofence_test, public;