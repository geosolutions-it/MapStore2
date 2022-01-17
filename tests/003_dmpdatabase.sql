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
15	\N	attributes	\N	null	STRING	14
18	\N	detailsSettings	\N	{}	STRING	14
20	\N	attributes	\N	null	STRING	19
24	\N	detailsSettings	\N	{}	STRING	19
25	\N	featured	\N	true	STRING	19
27	\N	attributes	\N	null	STRING	26
31	\N	detailsSettings	\N	{}	STRING	26
32	\N	featured	\N	true	STRING	26
42	\N	featured	\N	true	STRING	33
43	\N	featured	\N	true	STRING	36
60	\N	thumbnail	\N	rest/geostore/data/56/raw?decode=datauri&v=94f11950-77b4-11ec-bacc-6bfb38edc96a	STRING	33
\.


--
-- Data for Name: gs_category; Type: TABLE DATA; Schema: geostore; Owner: geostore
--

COPY geostore.gs_category (id, name) FROM stdin;
1	MAP
2	THUMBNAIL
3	DETAILS
4	DASHBOARD
5	GEOSTORY
6	CONTEXT
7	TEMPLATE
8	USERSESSION
\.


--
-- Data for Name: gs_resource; Type: TABLE DATA; Schema: geostore; Owner: geostore
--

COPY geostore.gs_resource (id, creation, description, lastupdate, metadata, name, category_id) FROM stdin;
14	2022-01-14 19:16:43.93		\N		Private Test Map	1
19	2022-01-14 19:17:06.32		\N		Public Test Map	1
26	2022-01-14 19:26:39.414		\N		Public Test Map 2	1
36	2022-01-14 19:30:54.579		\N		Geostory Public Test	5
44	2022-01-17 15:58:16.617		\N		Dashboard Private Test	4
47	2022-01-17 15:58:44.993		\N		Geostory Private Test	5
33	2022-01-14 19:30:19.591		2022-01-17 16:43:24.624		Dashboard Public Test	4
56	2022-01-17 16:43:24.734		\N		33-thumbnail-96678cb0-77b4-11ec-bacc-6bfb38edc96a	2
\.


--
-- Data for Name: gs_security; Type: TABLE DATA; Schema: geostore; Owner: geostore
--

COPY geostore.gs_security (id, canread, canwrite, group_id, resource_id, user_id, username, groupname) FROM stdin;
17	t	t	\N	14	12	\N	\N
22	t	t	\N	19	12	\N	\N
23	t	f	9	19	\N	\N	\N
29	t	t	\N	26	12	\N	\N
30	t	f	9	26	\N	\N	\N
38	t	t	\N	36	12	\N	\N
39	t	f	9	36	\N	\N	\N
46	t	t	\N	44	12	\N	\N
49	t	t	\N	47	12	\N	\N
54	t	t	\N	33	12	\N	\N
55	t	f	9	33	\N	\N	\N
58	t	t	\N	56	12	\N	\N
59	t	f	9	56	\N	\N	\N
\.


--
-- Data for Name: gs_stored_data; Type: TABLE DATA; Schema: geostore; Owner: geostore
--

COPY geostore.gs_stored_data (id, stored_data, resource_id) FROM stdin;
14	{"version":2,"map":{"center":{"x":11.22894105149402,"y":43.380053862794,"crs":"EPSG:4326"},"maxExtent":[-20037508.34,-20037508.34,20037508.34,20037508.34],"projection":"EPSG:900913","units":"m","zoom":5,"mapOptions":{},"layers":[{"id":"mapnik__0","group":"background","source":"osm","name":"mapnik","title":"Open Street Map","type":"osm","visibility":true,"singleTile":false,"dimensions":[],"hideLoading":false,"handleClickOnLayer":false,"useForElevation":false,"hidden":false},{"id":"Night2012__1","group":"background","source":"nasagibs","name":"Night2012","provider":"NASAGIBS.ViirsEarthAtNight2012","title":"NASAGIBS Night 2012","type":"tileprovider","visibility":false,"singleTile":false,"dimensions":[],"hideLoading":false,"handleClickOnLayer":false,"useForElevation":false,"hidden":false},{"id":"OpenTopoMap__2","group":"background","source":"OpenTopoMap","name":"OpenTopoMap","provider":"OpenTopoMap","title":"OpenTopoMap","type":"tileprovider","visibility":false,"singleTile":false,"dimensions":[],"hideLoading":false,"handleClickOnLayer":false,"useForElevation":false,"hidden":false},{"id":"s2cloudless:s2cloudless__3","format":"image/jpeg","group":"background","source":"s2cloudless","name":"s2cloudless:s2cloudless","opacity":1,"title":"Sentinel 2 Cloudless","type":"wms","url":["https://1maps.geo-solutions.it/geoserver/wms","https://2maps.geo-solutions.it/geoserver/wms","https://3maps.geo-solutions.it/geoserver/wms","https://4maps.geo-solutions.it/geoserver/wms","https://5maps.geo-solutions.it/geoserver/wms","https://6maps.geo-solutions.it/geoserver/wms"],"visibility":false,"singleTile":false,"dimensions":[],"hideLoading":false,"handleClickOnLayer":false,"useForElevation":false,"hidden":false},{"id":"undefined__4","group":"background","source":"ol","title":"Empty Background","type":"empty","visibility":false,"singleTile":false,"dimensions":[],"hideLoading":false,"handleClickOnLayer":false,"useForElevation":false,"hidden":false}],"groups":[],"backgrounds":[],"bookmark_search_config":{}},"catalogServices":{"services":{"gs_stable_csw":{"url":"https://gs-stable.geo-solutions.it/geoserver/csw","type":"csw","title":"GeoSolutions GeoServer CSW","autoload":true},"gs_stable_wms":{"url":"https://gs-stable.geo-solutions.it/geoserver/wms","type":"wms","title":"GeoSolutions GeoServer WMS","autoload":false},"gs_stable_wmts":{"url":"https://gs-stable.geo-solutions.it/geoserver/gwc/service/wmts","type":"wmts","title":"GeoSolutions GeoServer WMTS","autoload":false}},"selectedService":"gs_stable_csw"},"widgetsConfig":{},"mapInfoConfiguration":{"trigger":"click"},"dimensionData":{},"timelineData":{}}	14
19	{"version":2,"map":{"center":{"x":11.22894105149402,"y":43.380053862794,"crs":"EPSG:4326"},"maxExtent":[-20037508.34,-20037508.34,20037508.34,20037508.34],"projection":"EPSG:900913","units":"m","zoom":5,"mapOptions":{},"layers":[{"id":"mapnik__0","group":"background","source":"osm","name":"mapnik","title":"Open Street Map","type":"osm","visibility":true,"singleTile":false,"dimensions":[],"hideLoading":false,"handleClickOnLayer":false,"useForElevation":false,"hidden":false},{"id":"Night2012__1","group":"background","source":"nasagibs","name":"Night2012","provider":"NASAGIBS.ViirsEarthAtNight2012","title":"NASAGIBS Night 2012","type":"tileprovider","visibility":false,"singleTile":false,"dimensions":[],"hideLoading":false,"handleClickOnLayer":false,"useForElevation":false,"hidden":false},{"id":"OpenTopoMap__2","group":"background","source":"OpenTopoMap","name":"OpenTopoMap","provider":"OpenTopoMap","title":"OpenTopoMap","type":"tileprovider","visibility":false,"singleTile":false,"dimensions":[],"hideLoading":false,"handleClickOnLayer":false,"useForElevation":false,"hidden":false},{"id":"s2cloudless:s2cloudless__3","format":"image/jpeg","group":"background","source":"s2cloudless","name":"s2cloudless:s2cloudless","opacity":1,"title":"Sentinel 2 Cloudless","type":"wms","url":["https://1maps.geo-solutions.it/geoserver/wms","https://2maps.geo-solutions.it/geoserver/wms","https://3maps.geo-solutions.it/geoserver/wms","https://4maps.geo-solutions.it/geoserver/wms","https://5maps.geo-solutions.it/geoserver/wms","https://6maps.geo-solutions.it/geoserver/wms"],"visibility":false,"singleTile":false,"dimensions":[],"hideLoading":false,"handleClickOnLayer":false,"useForElevation":false,"hidden":false},{"id":"undefined__4","group":"background","source":"ol","title":"Empty Background","type":"empty","visibility":false,"singleTile":false,"dimensions":[],"hideLoading":false,"handleClickOnLayer":false,"useForElevation":false,"hidden":false}],"groups":[],"backgrounds":[],"bookmark_search_config":{}},"catalogServices":{"services":{"gs_stable_csw":{"url":"https://gs-stable.geo-solutions.it/geoserver/csw","type":"csw","title":"GeoSolutions GeoServer CSW","autoload":true},"gs_stable_wms":{"url":"https://gs-stable.geo-solutions.it/geoserver/wms","type":"wms","title":"GeoSolutions GeoServer WMS","autoload":false},"gs_stable_wmts":{"url":"https://gs-stable.geo-solutions.it/geoserver/gwc/service/wmts","type":"wmts","title":"GeoSolutions GeoServer WMTS","autoload":false}},"selectedService":"gs_stable_csw"},"widgetsConfig":{"layouts":{"xxs":[],"md":[]}},"mapInfoConfiguration":{"trigger":"click"},"dimensionData":{},"timelineData":{}}	19
26	{"version":2,"map":{"center":{"x":11.22894105149402,"y":43.380053862794,"crs":"EPSG:4326"},"maxExtent":[-20037508.34,-20037508.34,20037508.34,20037508.34],"projection":"EPSG:900913","units":"m","zoom":5,"mapOptions":{},"layers":[{"id":"mapnik__0","group":"background","source":"osm","name":"mapnik","title":"Open Street Map","type":"osm","visibility":true,"singleTile":false,"dimensions":[],"hideLoading":false,"handleClickOnLayer":false,"useForElevation":false,"hidden":false},{"id":"Night2012__1","group":"background","source":"nasagibs","name":"Night2012","provider":"NASAGIBS.ViirsEarthAtNight2012","title":"NASAGIBS Night 2012","type":"tileprovider","visibility":false,"singleTile":false,"dimensions":[],"hideLoading":false,"handleClickOnLayer":false,"useForElevation":false,"hidden":false},{"id":"OpenTopoMap__2","group":"background","source":"OpenTopoMap","name":"OpenTopoMap","provider":"OpenTopoMap","title":"OpenTopoMap","type":"tileprovider","visibility":false,"singleTile":false,"dimensions":[],"hideLoading":false,"handleClickOnLayer":false,"useForElevation":false,"hidden":false},{"id":"s2cloudless:s2cloudless__3","format":"image/jpeg","group":"background","source":"s2cloudless","name":"s2cloudless:s2cloudless","opacity":1,"title":"Sentinel 2 Cloudless","type":"wms","url":["https://1maps.geo-solutions.it/geoserver/wms","https://2maps.geo-solutions.it/geoserver/wms","https://3maps.geo-solutions.it/geoserver/wms","https://4maps.geo-solutions.it/geoserver/wms","https://5maps.geo-solutions.it/geoserver/wms","https://6maps.geo-solutions.it/geoserver/wms"],"visibility":false,"singleTile":false,"dimensions":[],"hideLoading":false,"handleClickOnLayer":false,"useForElevation":false,"hidden":false},{"id":"undefined__4","group":"background","source":"ol","title":"Empty Background","type":"empty","visibility":false,"singleTile":false,"dimensions":[],"hideLoading":false,"handleClickOnLayer":false,"useForElevation":false,"hidden":false}],"groups":[],"backgrounds":[],"bookmark_search_config":{}},"catalogServices":{"services":{"gs_stable_csw":{"url":"https://gs-stable.geo-solutions.it/geoserver/csw","type":"csw","title":"GeoSolutions GeoServer CSW","autoload":true},"gs_stable_wms":{"url":"https://gs-stable.geo-solutions.it/geoserver/wms","type":"wms","title":"GeoSolutions GeoServer WMS","autoload":false},"gs_stable_wmts":{"url":"https://gs-stable.geo-solutions.it/geoserver/gwc/service/wmts","type":"wmts","title":"GeoSolutions GeoServer WMTS","autoload":false}},"selectedService":"gs_stable_csw"},"widgetsConfig":{},"mapInfoConfiguration":{"trigger":"click"},"dimensionData":{},"timelineData":{}}	26
36	{"type":"cascade","resources":[],"settings":{"theme":{"general":{"color":"#333333","backgroundColor":"#ffffff","borderColor":"#e6e6e6"},"overlay":{"backgroundColor":"rgba(255, 255, 255, 0.75)","borderColor":"#dddddd","boxShadow":"0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)","color":"#333333"}}},"sections":[{"type":"title","id":"6ebba160-7570-11ec-b738-9d9ecffb0439","title":"Abstract","cover":true,"contents":[{"id":"title_content_id1","type":"text","size":"large","align":"center","theme":"","html":"<h1>GeoStory Test</h1>\\n","background":{"fit":"cover","size":"full","align":"center"}}]}]}	36
44	{"widgets":[{"id":"43292eb0-77ae-11ec-a2ae-25409fa71132","layer":false,"url":false,"legend":false,"mapSync":false,"cartesian":true,"yAxis":true,"widgetType":"text","title":"Dashboard Private Test","dataGrid":{"y":0,"x":0,"w":1,"h":1}}],"layouts":{"md":[{"w":1,"h":1,"x":0,"y":0,"i":"43292eb0-77ae-11ec-a2ae-25409fa71132","moved":false,"static":false}]}}	44
47	{"type":"cascade","resources":[],"settings":{"theme":{"general":{"color":"#333333","backgroundColor":"#ffffff","borderColor":"#e6e6e6"},"overlay":{"backgroundColor":"rgba(255, 255, 255, 0.75)","borderColor":"#dddddd","boxShadow":"0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)","color":"#333333"}}},"sections":[{"type":"title","id":"50a97360-77ae-11ec-a2ae-25409fa71132","title":"Abstract","cover":true,"contents":[{"id":"title_content_id1","type":"text","size":"large","align":"center","theme":"","html":"<h1>Geostory Private Test</h1>\\n","background":{"fit":"cover","size":"full","align":"center"}}]}]}	47
33	{"widgets":[{"id":"602c84c0-7570-11ec-b738-9d9ecffb0439","layer":false,"url":false,"legend":false,"mapSync":false,"cartesian":true,"yAxis":true,"widgetType":"text","title":"Dashboard Test","dataGrid":{"y":0,"x":0,"w":1,"h":1}},{"id":"0ec51b60-77b4-11ec-8921-651ba1f75248","layer":false,"url":false,"legend":false,"mapSync":false,"cartesian":true,"yAxis":true,"widgetType":"map","map":{"center":{"x":11.22894105149402,"y":43.380053862794,"crs":"EPSG:4326"},"maxExtent":[-20037508.34,-20037508.34,20037508.34,20037508.34],"projection":"EPSG:900913","units":"m","zoom":5,"mapOptions":{},"backgrounds":[],"bookmark_search_config":{},"groups":[],"layers":[{"id":"mapnik__0","group":"background","source":"osm","name":"mapnik","title":"Open Street Map","type":"osm","visibility":true,"singleTile":false,"dimensions":[],"hideLoading":false,"handleClickOnLayer":false,"useForElevation":false,"hidden":false},{"id":"Night2012__1","group":"background","source":"nasagibs","name":"Night2012","provider":"NASAGIBS.ViirsEarthAtNight2012","title":"NASAGIBS Night 2012","type":"tileprovider","visibility":false,"singleTile":false,"dimensions":[],"hideLoading":false,"handleClickOnLayer":false,"useForElevation":false,"hidden":false},{"id":"OpenTopoMap__2","group":"background","source":"OpenTopoMap","name":"OpenTopoMap","provider":"OpenTopoMap","title":"OpenTopoMap","type":"tileprovider","visibility":false,"singleTile":false,"dimensions":[],"hideLoading":false,"handleClickOnLayer":false,"useForElevation":false,"hidden":false},{"id":"s2cloudless:s2cloudless__3","format":"image/jpeg","group":"background","source":"s2cloudless","name":"s2cloudless:s2cloudless","opacity":1,"title":"Sentinel 2 Cloudless","type":"wms","url":["https://1maps.geo-solutions.it/geoserver/wms","https://2maps.geo-solutions.it/geoserver/wms","https://3maps.geo-solutions.it/geoserver/wms","https://4maps.geo-solutions.it/geoserver/wms","https://5maps.geo-solutions.it/geoserver/wms","https://6maps.geo-solutions.it/geoserver/wms"],"visibility":false,"singleTile":false,"dimensions":[],"hideLoading":false,"handleClickOnLayer":false,"useForElevation":false,"hidden":false},{"id":"undefined__4","group":"background","source":"ol","title":"Empty Background","type":"empty","visibility":false,"singleTile":false,"dimensions":[],"hideLoading":false,"handleClickOnLayer":false,"useForElevation":false,"hidden":false},{"type":"wms","url":"https://gs-stable.geo-solutions.it/geoserver/wms","visibility":true,"dimensions":[],"name":"test:dati","title":"dati","description":"","bbox":{"crs":"EPSG:4326","bounds":{"minx":-90,"miny":-180,"maxx":90,"maxy":180}},"links":[],"params":{},"allowedSRS":{},"search":{"type":"wfs","url":"https://gs-stable.geo-solutions.it/geoserver/wfs"},"id":"test:dati__95ipwvhl00t"}],"mapInfoControl":true,"bbox":{"bounds":{"minx":565124.226564821,"miny":5118063.5547720585,"maxx":1934875.7734351796,"maxy":5621936.44522794},"crs":"EPSG:3857","rotation":0},"size":{"width":280,"height":103},"mapStateSource":"0ec51b60-77b4-11ec-8921-651ba1f75248","resolution":4891.96981025128},"mapStateSource":"__base_map__","title":"Test","dataGrid":{"y":0,"x":0,"w":1,"h":1,"isDraggable":true,"isResizable":true}},{"id":"44bba6d0-77b4-11ec-bacc-6bfb38edc96a","layer":{"type":"wms","url":"https://gs-stable.geo-solutions.it/geoserver/wms","visibility":true,"dimensions":[],"name":"test:thematism_comuni","title":"thematism_comuni","description":"","bbox":{"crs":"EPSG:4326","bounds":{"minx":6.53887860239646,"miny":35.218368229701326,"maxx":19.613738116097192,"maxy":47.1358216210509}},"links":[],"params":{},"allowedSRS":{},"search":{"type":"wfs","url":"https://gs-stable.geo-solutions.it/geoserver/wfs"}},"url":"https://gs-stable.geo-solutions.it/geoserver/wms","legend":false,"mapSync":false,"cartesian":true,"yAxis":true,"type":"bar","widgetType":"chart","geomProp":"geom","options":{"groupByAttributes":"pro_com","aggregationAttribute":"thema","aggregateFunction":"Count"},"autoColorOptions":{"base":10,"range":4,"name":"global.colors.red"},"title":"Test","dataGrid":{"y":0,"x":0,"w":1,"h":1,"isDraggable":false,"isResizable":false}}],"layouts":{"xxs":[{"w":1,"h":1,"x":0,"y":0,"i":"44bba6d0-77b4-11ec-bacc-6bfb38edc96a","moved":false,"isDraggable":false,"isResizable":false}],"md":[{"w":1,"h":1,"x":0,"y":0,"i":"602c84c0-7570-11ec-b738-9d9ecffb0439","moved":false,"static":false},{"w":1,"h":1,"x":0,"y":1,"i":"0ec51b60-77b4-11ec-8921-651ba1f75248","moved":false,"static":false,"isDraggable":true,"isResizable":true},{"w":1,"h":1,"x":0,"y":2,"i":"44bba6d0-77b4-11ec-bacc-6bfb38edc96a","moved":false,"static":false,"isDraggable":false,"isResizable":false}]}}	33
56	data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAC0CAIAAAChXYa4AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAPaSURBVHhe7dlBTmJBFIbRXojDXo0j1sKAtZi4FONSdAcOCANjYmI/pEAkhk469vuv3HNSA1KAxlv58sD36w2IEiGEiRDCRAhhIoQwEUKYCCFMhBAmQggTIYSJEMJECGEihDARQpgIIUyEECZCCBMhhIkQwkQIYSKEMBFCmAghTIQQJkIIEyGEiRDCRAhhIoQwEUKYCCFMhBAmQggTIYSJEMJECGH5CJ+ufluRNQ6ANBH2XeMASBNh3zUOgDQR9l3jAEgTYd81DoC0chGOXf4Do65JhI0YdU0ibMSoaxJhI0ZdkwgbMeqaRNiIUdckwkaMuiYRNmLUNYmwEaOuSYSNGHVNImzEqGsSYSNGXZMIGzHqmkTYiFHXJMJGjLqmHx7h3erk7Z/W8n687B/db65vX8fjS3Ayn7FL2iVdCR+fr1cv4/G3ECFzEOEZImQOIjxDhMyhSYSPz8vF7uevlyddPb7sn3q6WmxuHne7rzeHze3+88Nu+2c7+ou2a+yS1iHCaX+xudvXdbdaH13fpgKf909tg7z56NCVkHlcfoSvN6vN3Xi8M13lDjsvyzOfYEXIHC4+wq82H27Xh7sX7xfGl68/bYqQOXSI8NPPH+v4FuLD9Cl0tVku1tero4+mExEyhwYRnv4n5pzpG6PvhMys5cfRc46jFSFz6PCPmcX64+L2bvoeOHamt5xkJkLmdvkRvu8f36K4nb77HV62TXR5vy9te8/wqNjtGy/jDuHO942a79QhwsnHzfqn6TWfu9reORy/fSrwEOS7/VOn19KfaUxgv8YuaZcUIX9h1DWJsBGjrkmEjRh1TSJsxKhrEmEjRl2TCBsx6ppE2IhR1yTCRoy6JhE2YtQ1ibARo65JhI0YdU0ibMSoaxJhI0ZdkwgbMeqaRNiIUdckwkaMuiYRNmLUNYmwEaOuqVyE1mxrHABpIuy7xgGQJsK+axwAaSLsu8YBkCbCvmscAGn5CKE5EUKYCCFMhBAmQggTIYSJEMJECGEihDARQpgIIUyEECZCCBMhhIkQwkQIYSKEMBFCmAghTIQQJkIIEyGEiRDCRAhhIoQwEUKYCCFMhBAmQggTIYSJEMJECGEihDARQpgIIUyEECZCCBMhhIkQwkQIYSKEMBFCmAghTIQQJkIIEyGEiRDCRAhhIoQwEUKYCCFMhBAmQggTIYSJEMJECGEihDARQpgIIUyEECZCCBMhhIkQwkQIYSKEMBFCmAghTIQQJkIIEyGEiRDCRAhhIoQwEUKYCCFMhBAmQggTIYSJEMJECGEihDARQpgIIUyEECZCCBMhhIkQot7e/gBAI6m79S3QcwAAAABJRU5ErkJggg==	56
\.


--
-- Data for Name: gs_user; Type: TABLE DATA; Schema: geostore; Owner: geostore
--

COPY geostore.gs_user (id, name, user_password, user_role, group_id, enabled) FROM stdin;
11	guest	\N	GUEST	\N	Y
12	admin	digest1:OQVijuljEAO0pjAyWpSzoZ9G2ROVJk4PBWpxH/8Td8Y4fegr2PKuNw15zHciPbZE	ADMIN	\N	Y
13	user	digest1:4Dp+1Em4Ruxo+dDMjA6rWiVjXtF22vh31Vv36O6ITaA1iHVObRgdeesK5pCL9wWV	USER	\N	Y
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
9	everyone	\N	Y
10	testGroup1	description	Y
\.


--
-- Data for Name: gs_usergroup_members; Type: TABLE DATA; Schema: geostore; Owner: geostore
--

COPY geostore.gs_usergroup_members (user_id, group_id) FROM stdin;
11	9
12	9
13	9
\.


--
-- Data for Name: spatial_ref_sys; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spatial_ref_sys (srid, auth_name, auth_srid, srtext, proj4text) FROM stdin;
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

SELECT pg_catalog.setval('geostore.hibernate_sequence', 60, true);


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