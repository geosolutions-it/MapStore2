--
-- PostgreSQL database dump
--

-- Dumped from database version 12.9 (Debian 12.9-1.pgdg110+1)
-- Dumped by pg_dump version 12.9 (Debian 12.9-1.pgdg110+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: geostore; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA geostore;


ALTER SCHEMA geostore OWNER TO postgres;

--
-- Name: geostore_test; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA geostore_test;


ALTER SCHEMA geostore_test OWNER TO postgres;

--
-- Name: tiger; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA tiger;


ALTER SCHEMA tiger OWNER TO postgres;

--
-- Name: tiger_data; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA tiger_data;


ALTER SCHEMA tiger_data OWNER TO postgres;

--
-- Name: topology; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA topology;


ALTER SCHEMA topology OWNER TO postgres;

--
-- Name: SCHEMA topology; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA topology IS 'PostGIS Topology schema';


--
-- Name: fuzzystrmatch; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS fuzzystrmatch WITH SCHEMA public;


--
-- Name: EXTENSION fuzzystrmatch; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION fuzzystrmatch IS 'determine similarities and distance between strings';


--
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';


--
-- Name: postgis_tiger_geocoder; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis_tiger_geocoder WITH SCHEMA tiger;


--
-- Name: EXTENSION postgis_tiger_geocoder; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis_tiger_geocoder IS 'PostGIS tiger geocoder and reverse geocoder';


--
-- Name: postgis_topology; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis_topology WITH SCHEMA topology;


--
-- Name: EXTENSION postgis_topology; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis_topology IS 'PostGIS topology spatial types and functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: gs_attribute; Type: TABLE; Schema: geostore; Owner: geostore
--

CREATE TABLE geostore.gs_attribute (
    id bigint NOT NULL,
    attribute_date timestamp without time zone,
    name character varying(255) NOT NULL,
    attribute_number double precision,
    attribute_text character varying(255),
    attribute_type character varying(255) NOT NULL,
    resource_id bigint NOT NULL
);


ALTER TABLE geostore.gs_attribute OWNER TO geostore;

--
-- Name: gs_category; Type: TABLE; Schema: geostore; Owner: geostore
--

CREATE TABLE geostore.gs_category (
    id bigint NOT NULL,
    name character varying(255) NOT NULL
);


ALTER TABLE geostore.gs_category OWNER TO geostore;

--
-- Name: gs_resource; Type: TABLE; Schema: geostore; Owner: geostore
--

CREATE TABLE geostore.gs_resource (
    id bigint NOT NULL,
    creation timestamp without time zone NOT NULL,
    description character varying(10000),
    lastupdate timestamp without time zone,
    metadata character varying(30000),
    name character varying(255) NOT NULL,
    category_id bigint NOT NULL
);


ALTER TABLE geostore.gs_resource OWNER TO geostore;

--
-- Name: gs_security; Type: TABLE; Schema: geostore; Owner: geostore
--

CREATE TABLE geostore.gs_security (
    id bigint NOT NULL,
    canread boolean NOT NULL,
    canwrite boolean NOT NULL,
    group_id bigint,
    resource_id bigint,
    user_id bigint,
    username character varying(255),
    groupname character varying(255)
);


ALTER TABLE geostore.gs_security OWNER TO geostore;

--
-- Name: gs_stored_data; Type: TABLE; Schema: geostore; Owner: geostore
--

CREATE TABLE geostore.gs_stored_data (
    id bigint NOT NULL,
    stored_data character varying(10000000) NOT NULL,
    resource_id bigint NOT NULL
);


ALTER TABLE geostore.gs_stored_data OWNER TO geostore;

--
-- Name: gs_user; Type: TABLE; Schema: geostore; Owner: geostore
--

CREATE TABLE geostore.gs_user (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    user_password character varying(255),
    user_role character varying(255) NOT NULL,
    group_id bigint,
    enabled character(1) DEFAULT 'Y'::bpchar NOT NULL
);


ALTER TABLE geostore.gs_user OWNER TO geostore;

--
-- Name: gs_user_attribute; Type: TABLE; Schema: geostore; Owner: geostore
--

CREATE TABLE geostore.gs_user_attribute (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    string character varying(255),
    user_id bigint NOT NULL
);


ALTER TABLE geostore.gs_user_attribute OWNER TO geostore;

--
-- Name: gs_usergroup; Type: TABLE; Schema: geostore; Owner: geostore
--

CREATE TABLE geostore.gs_usergroup (
    id bigint NOT NULL,
    groupname character varying(255) NOT NULL,
    description character varying(255),
    enabled character(1) DEFAULT 'Y'::bpchar NOT NULL
);


ALTER TABLE geostore.gs_usergroup OWNER TO geostore;

--
-- Name: gs_usergroup_members; Type: TABLE; Schema: geostore; Owner: geostore
--

CREATE TABLE geostore.gs_usergroup_members (
    user_id bigint NOT NULL,
    group_id bigint NOT NULL
);


ALTER TABLE geostore.gs_usergroup_members OWNER TO geostore;

--
-- Name: hibernate_sequence; Type: SEQUENCE; Schema: geostore; Owner: geostore
--

CREATE SEQUENCE geostore.hibernate_sequence
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE geostore.hibernate_sequence OWNER TO geostore;

--
-- Data for Name: gs_attribute; Type: TABLE DATA; Schema: geostore; Owner: geostore
--

COPY geostore.gs_attribute (id, attribute_date, name, attribute_number, attribute_text, attribute_type, resource_id) FROM stdin;
\.


--
-- Data for Name: gs_category; Type: TABLE DATA; Schema: geostore; Owner: geostore
--

COPY geostore.gs_category (id, name) FROM stdin;
\.


--
-- Data for Name: gs_resource; Type: TABLE DATA; Schema: geostore; Owner: geostore
--

COPY geostore.gs_resource (id, creation, description, lastupdate, metadata, name, category_id) FROM stdin;
\.


--
-- Data for Name: gs_security; Type: TABLE DATA; Schema: geostore; Owner: geostore
--

COPY geostore.gs_security (id, canread, canwrite, group_id, resource_id, user_id, username, groupname) FROM stdin;
\.


--
-- Data for Name: gs_stored_data; Type: TABLE DATA; Schema: geostore; Owner: geostore
--

COPY geostore.gs_stored_data (id, stored_data, resource_id) FROM stdin;
\.


--
-- Data for Name: gs_user; Type: TABLE DATA; Schema: geostore; Owner: geostore
--

COPY geostore.gs_user (id, name, user_password, user_role, group_id, enabled) FROM stdin;
\.


--
-- Data for Name: gs_user_attribute; Type: TABLE DATA; Schema: geostore; Owner: geostore
--

COPY geostore.gs_user_attribute (id, name, string, user_id) FROM stdin;
\.


--
-- Data for Name: gs_usergroup; Type: TABLE DATA; Schema: geostore; Owner: geostore
--

COPY geostore.gs_usergroup (id, groupname, description, enabled) FROM stdin;
\.


--
-- Data for Name: gs_usergroup_members; Type: TABLE DATA; Schema: geostore; Owner: geostore
--

COPY geostore.gs_usergroup_members (user_id, group_id) FROM stdin;
\.


--
-- Data for Name: spatial_ref_sys; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spatial_ref_sys (srid, auth_name, auth_srid, srtext, proj4text) FROM stdin;
\.


--
-- Data for Name: geocode_settings; Type: TABLE DATA; Schema: tiger; Owner: postgres
--

COPY tiger.geocode_settings (name, setting, unit, category, short_desc) FROM stdin;
\.


--
-- Data for Name: pagc_gaz; Type: TABLE DATA; Schema: tiger; Owner: postgres
--

COPY tiger.pagc_gaz (id, seq, word, stdword, token, is_custom) FROM stdin;
\.


--
-- Data for Name: pagc_lex; Type: TABLE DATA; Schema: tiger; Owner: postgres
--

COPY tiger.pagc_lex (id, seq, word, stdword, token, is_custom) FROM stdin;
\.


--
-- Data for Name: pagc_rules; Type: TABLE DATA; Schema: tiger; Owner: postgres
--

COPY tiger.pagc_rules (id, rule, is_custom) FROM stdin;
\.


--
-- Data for Name: topology; Type: TABLE DATA; Schema: topology; Owner: postgres
--

COPY topology.topology (id, name, srid, "precision", hasz) FROM stdin;
\.


--
-- Data for Name: layer; Type: TABLE DATA; Schema: topology; Owner: postgres
--

COPY topology.layer (topology_id, layer_id, schema_name, table_name, feature_column, feature_type, level, child_id) FROM stdin;
\.


--
-- Name: hibernate_sequence; Type: SEQUENCE SET; Schema: geostore; Owner: geostore
--

SELECT pg_catalog.setval('geostore.hibernate_sequence', 1, false);


--
-- Name: gs_attribute gs_attribute_name_resource_id_key; Type: CONSTRAINT; Schema: geostore; Owner: geostore
--

ALTER TABLE ONLY geostore.gs_attribute
    ADD CONSTRAINT gs_attribute_name_resource_id_key UNIQUE (name, resource_id);


--
-- Name: gs_attribute gs_attribute_pkey; Type: CONSTRAINT; Schema: geostore; Owner: geostore
--

ALTER TABLE ONLY geostore.gs_attribute
    ADD CONSTRAINT gs_attribute_pkey PRIMARY KEY (id);


--
-- Name: gs_category gs_category_name_key; Type: CONSTRAINT; Schema: geostore; Owner: geostore
--

ALTER TABLE ONLY geostore.gs_category
    ADD CONSTRAINT gs_category_name_key UNIQUE (name);


--
-- Name: gs_category gs_category_pkey; Type: CONSTRAINT; Schema: geostore; Owner: geostore
--

ALTER TABLE ONLY geostore.gs_category
    ADD CONSTRAINT gs_category_pkey PRIMARY KEY (id);


--
-- Name: gs_resource gs_resource_name_key; Type: CONSTRAINT; Schema: geostore; Owner: geostore
--

ALTER TABLE ONLY geostore.gs_resource
    ADD CONSTRAINT gs_resource_name_key UNIQUE (name);


--
-- Name: gs_resource gs_resource_pkey; Type: CONSTRAINT; Schema: geostore; Owner: geostore
--

ALTER TABLE ONLY geostore.gs_resource
    ADD CONSTRAINT gs_resource_pkey PRIMARY KEY (id);


--
-- Name: gs_security gs_security_pkey; Type: CONSTRAINT; Schema: geostore; Owner: geostore
--

ALTER TABLE ONLY geostore.gs_security
    ADD CONSTRAINT gs_security_pkey PRIMARY KEY (id);


--
-- Name: gs_security gs_security_resource_id_group_id_key; Type: CONSTRAINT; Schema: geostore; Owner: geostore
--

ALTER TABLE ONLY geostore.gs_security
    ADD CONSTRAINT gs_security_resource_id_group_id_key UNIQUE (resource_id, group_id);


--
-- Name: gs_security gs_security_user_id_resource_id_key; Type: CONSTRAINT; Schema: geostore; Owner: geostore
--

ALTER TABLE ONLY geostore.gs_security
    ADD CONSTRAINT gs_security_user_id_resource_id_key UNIQUE (user_id, resource_id);


--
-- Name: gs_stored_data gs_stored_data_pkey; Type: CONSTRAINT; Schema: geostore; Owner: geostore
--

ALTER TABLE ONLY geostore.gs_stored_data
    ADD CONSTRAINT gs_stored_data_pkey PRIMARY KEY (id);


--
-- Name: gs_stored_data gs_stored_data_resource_id_key; Type: CONSTRAINT; Schema: geostore; Owner: geostore
--

ALTER TABLE ONLY geostore.gs_stored_data
    ADD CONSTRAINT gs_stored_data_resource_id_key UNIQUE (resource_id);


--
-- Name: gs_user_attribute gs_user_attribute_name_user_id_key; Type: CONSTRAINT; Schema: geostore; Owner: geostore
--

ALTER TABLE ONLY geostore.gs_user_attribute
    ADD CONSTRAINT gs_user_attribute_name_user_id_key UNIQUE (name, user_id);


--
-- Name: gs_user_attribute gs_user_attribute_pkey; Type: CONSTRAINT; Schema: geostore; Owner: geostore
--

ALTER TABLE ONLY geostore.gs_user_attribute
    ADD CONSTRAINT gs_user_attribute_pkey PRIMARY KEY (id);


--
-- Name: gs_user gs_user_name_key; Type: CONSTRAINT; Schema: geostore; Owner: geostore
--

ALTER TABLE ONLY geostore.gs_user
    ADD CONSTRAINT gs_user_name_key UNIQUE (name);


--
-- Name: gs_user gs_user_pkey; Type: CONSTRAINT; Schema: geostore; Owner: geostore
--

ALTER TABLE ONLY geostore.gs_user
    ADD CONSTRAINT gs_user_pkey PRIMARY KEY (id);


--
-- Name: gs_usergroup gs_usergroup_groupname_key; Type: CONSTRAINT; Schema: geostore; Owner: geostore
--

ALTER TABLE ONLY geostore.gs_usergroup
    ADD CONSTRAINT gs_usergroup_groupname_key UNIQUE (groupname);


--
-- Name: gs_usergroup_members gs_usergroup_members_pkey; Type: CONSTRAINT; Schema: geostore; Owner: geostore
--

ALTER TABLE ONLY geostore.gs_usergroup_members
    ADD CONSTRAINT gs_usergroup_members_pkey PRIMARY KEY (user_id, group_id);


--
-- Name: gs_usergroup gs_usergroup_pkey; Type: CONSTRAINT; Schema: geostore; Owner: geostore
--

ALTER TABLE ONLY geostore.gs_usergroup
    ADD CONSTRAINT gs_usergroup_pkey PRIMARY KEY (id);


--
-- Name: idx_attribute_date; Type: INDEX; Schema: geostore; Owner: geostore
--

CREATE INDEX idx_attribute_date ON geostore.gs_attribute USING btree (attribute_date);


--
-- Name: idx_attribute_name; Type: INDEX; Schema: geostore; Owner: geostore
--

CREATE INDEX idx_attribute_name ON geostore.gs_attribute USING btree (name);


--
-- Name: idx_attribute_number; Type: INDEX; Schema: geostore; Owner: geostore
--

CREATE INDEX idx_attribute_number ON geostore.gs_attribute USING btree (attribute_number);


--
-- Name: idx_attribute_resource; Type: INDEX; Schema: geostore; Owner: geostore
--

CREATE INDEX idx_attribute_resource ON geostore.gs_attribute USING btree (resource_id);


--
-- Name: idx_attribute_text; Type: INDEX; Schema: geostore; Owner: geostore
--

CREATE INDEX idx_attribute_text ON geostore.gs_attribute USING btree (attribute_text);


--
-- Name: idx_attribute_type; Type: INDEX; Schema: geostore; Owner: geostore
--

CREATE INDEX idx_attribute_type ON geostore.gs_attribute USING btree (attribute_type);


--
-- Name: idx_attribute_user; Type: INDEX; Schema: geostore; Owner: geostore
--

CREATE INDEX idx_attribute_user ON geostore.gs_user_attribute USING btree (user_id);


--
-- Name: idx_category_type; Type: INDEX; Schema: geostore; Owner: geostore
--

CREATE INDEX idx_category_type ON geostore.gs_category USING btree (name);


--
-- Name: idx_resource_category; Type: INDEX; Schema: geostore; Owner: geostore
--

CREATE INDEX idx_resource_category ON geostore.gs_resource USING btree (category_id);


--
-- Name: idx_resource_creation; Type: INDEX; Schema: geostore; Owner: geostore
--

CREATE INDEX idx_resource_creation ON geostore.gs_resource USING btree (creation);


--
-- Name: idx_resource_description; Type: INDEX; Schema: geostore; Owner: geostore
--

CREATE INDEX idx_resource_description ON geostore.gs_resource USING btree (description);


--
-- Name: idx_resource_metadata; Type: INDEX; Schema: geostore; Owner: geostore
--

CREATE INDEX idx_resource_metadata ON geostore.gs_resource USING btree (metadata);


--
-- Name: idx_resource_name; Type: INDEX; Schema: geostore; Owner: geostore
--

CREATE INDEX idx_resource_name ON geostore.gs_resource USING btree (name);


--
-- Name: idx_resource_update; Type: INDEX; Schema: geostore; Owner: geostore
--

CREATE INDEX idx_resource_update ON geostore.gs_resource USING btree (lastupdate);


--
-- Name: idx_security_group; Type: INDEX; Schema: geostore; Owner: geostore
--

CREATE INDEX idx_security_group ON geostore.gs_security USING btree (group_id);


--
-- Name: idx_security_groupname; Type: INDEX; Schema: geostore; Owner: geostore
--

CREATE INDEX idx_security_groupname ON geostore.gs_security USING btree (groupname);


--
-- Name: idx_security_read; Type: INDEX; Schema: geostore; Owner: geostore
--

CREATE INDEX idx_security_read ON geostore.gs_security USING btree (canread);


--
-- Name: idx_security_resource; Type: INDEX; Schema: geostore; Owner: geostore
--

CREATE INDEX idx_security_resource ON geostore.gs_security USING btree (resource_id);


--
-- Name: idx_security_user; Type: INDEX; Schema: geostore; Owner: geostore
--

CREATE INDEX idx_security_user ON geostore.gs_security USING btree (user_id);


--
-- Name: idx_security_username; Type: INDEX; Schema: geostore; Owner: geostore
--

CREATE INDEX idx_security_username ON geostore.gs_security USING btree (username);


--
-- Name: idx_security_write; Type: INDEX; Schema: geostore; Owner: geostore
--

CREATE INDEX idx_security_write ON geostore.gs_security USING btree (canwrite);


--
-- Name: idx_user_attribute_name; Type: INDEX; Schema: geostore; Owner: geostore
--

CREATE INDEX idx_user_attribute_name ON geostore.gs_user_attribute USING btree (name);


--
-- Name: idx_user_attribute_text; Type: INDEX; Schema: geostore; Owner: geostore
--

CREATE INDEX idx_user_attribute_text ON geostore.gs_user_attribute USING btree (string);


--
-- Name: idx_user_group; Type: INDEX; Schema: geostore; Owner: geostore
--

CREATE INDEX idx_user_group ON geostore.gs_user USING btree (group_id);


--
-- Name: idx_user_name; Type: INDEX; Schema: geostore; Owner: geostore
--

CREATE INDEX idx_user_name ON geostore.gs_user USING btree (name);


--
-- Name: idx_user_password; Type: INDEX; Schema: geostore; Owner: geostore
--

CREATE INDEX idx_user_password ON geostore.gs_user USING btree (user_password);


--
-- Name: idx_user_role; Type: INDEX; Schema: geostore; Owner: geostore
--

CREATE INDEX idx_user_role ON geostore.gs_user USING btree (user_role);


--
-- Name: idx_usergroup_name; Type: INDEX; Schema: geostore; Owner: geostore
--

CREATE INDEX idx_usergroup_name ON geostore.gs_usergroup USING btree (groupname);


--
-- Name: gs_attribute fk_attribute_resource; Type: FK CONSTRAINT; Schema: geostore; Owner: geostore
--

ALTER TABLE ONLY geostore.gs_attribute
    ADD CONSTRAINT fk_attribute_resource FOREIGN KEY (resource_id) REFERENCES geostore.gs_resource(id);


--
-- Name: gs_stored_data fk_data_resource; Type: FK CONSTRAINT; Schema: geostore; Owner: geostore
--

ALTER TABLE ONLY geostore.gs_stored_data
    ADD CONSTRAINT fk_data_resource FOREIGN KEY (resource_id) REFERENCES geostore.gs_resource(id);


--
-- Name: gs_resource fk_resource_category; Type: FK CONSTRAINT; Schema: geostore; Owner: geostore
--

ALTER TABLE ONLY geostore.gs_resource
    ADD CONSTRAINT fk_resource_category FOREIGN KEY (category_id) REFERENCES geostore.gs_category(id);


--
-- Name: gs_security fk_security_group; Type: FK CONSTRAINT; Schema: geostore; Owner: geostore
--

ALTER TABLE ONLY geostore.gs_security
    ADD CONSTRAINT fk_security_group FOREIGN KEY (group_id) REFERENCES geostore.gs_usergroup(id);


--
-- Name: gs_security fk_security_resource; Type: FK CONSTRAINT; Schema: geostore; Owner: geostore
--

ALTER TABLE ONLY geostore.gs_security
    ADD CONSTRAINT fk_security_resource FOREIGN KEY (resource_id) REFERENCES geostore.gs_resource(id);


--
-- Name: gs_security fk_security_user; Type: FK CONSTRAINT; Schema: geostore; Owner: geostore
--

ALTER TABLE ONLY geostore.gs_security
    ADD CONSTRAINT fk_security_user FOREIGN KEY (user_id) REFERENCES geostore.gs_user(id);


--
-- Name: gs_user_attribute fk_uattrib_user; Type: FK CONSTRAINT; Schema: geostore; Owner: geostore
--

ALTER TABLE ONLY geostore.gs_user_attribute
    ADD CONSTRAINT fk_uattrib_user FOREIGN KEY (user_id) REFERENCES geostore.gs_user(id);


--
-- Name: gs_user fk_user_ugroup; Type: FK CONSTRAINT; Schema: geostore; Owner: geostore
--

ALTER TABLE ONLY geostore.gs_user
    ADD CONSTRAINT fk_user_ugroup FOREIGN KEY (group_id) REFERENCES geostore.gs_usergroup(id);


--
-- Name: gs_usergroup_members fkfde460db62224f72; Type: FK CONSTRAINT; Schema: geostore; Owner: geostore
--

ALTER TABLE ONLY geostore.gs_usergroup_members
    ADD CONSTRAINT fkfde460db62224f72 FOREIGN KEY (user_id) REFERENCES geostore.gs_user(id);


--
-- Name: gs_usergroup_members fkfde460db9ec981b7; Type: FK CONSTRAINT; Schema: geostore; Owner: geostore
--

ALTER TABLE ONLY geostore.gs_usergroup_members
    ADD CONSTRAINT fkfde460db9ec981b7 FOREIGN KEY (group_id) REFERENCES geostore.gs_usergroup(id);


--
-- Name: SCHEMA geostore; Type: ACL; Schema: -; Owner: postgres
--

GRANT ALL ON SCHEMA geostore TO geostore;


--
-- Name: SCHEMA geostore_test; Type: ACL; Schema: -; Owner: postgres
--

GRANT ALL ON SCHEMA geostore_test TO geostore_test;


--
-- PostgreSQL database dump complete
--