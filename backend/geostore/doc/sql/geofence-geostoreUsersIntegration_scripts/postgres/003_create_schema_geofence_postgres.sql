set search_path to geofence;

-- CLEAN-UP
--drop table gf_gfuser cascade;
--drop table gf_rule_limits;
--drop table gf_layer_styles;
--drop table gf_layer_custom_props ;
--drop table gf_layer_attributes;
--drop table gf_layer_details;
--drop table gf_rule cascade;
--drop table gf_gsuser cascade;
--drop table gf_gsinstance cascade;
--drop table gf_user_usergroups;
--drop table gf_usergroup cascade;

-- drop view geofence.gf_gsuser;
-- drop view geofence.gf_user_usergroups;
-- drop view geofence.gf_usergroup;

--drop sequence hibernate_sequence;

-- TABLE CREATION
    create table gf_gfuser (
        id int8 not null,
        dateCreation timestamp,
        emailAddress varchar(255),
        enabled bool not null,
        extId varchar(255) unique,
        fullName varchar(255),
        name varchar(255) not null unique,
        password varchar(255),
        primary key (id)
    );

    create table gf_gsinstance (
        id int8 not null,
        baseURL varchar(255) not null,
        dateCreation timestamp,
        description varchar(255),
        name varchar(255) not null,
        password varchar(255) not null,
        username varchar(255) not null,
        primary key (id)
    );

    create table gf_layer_attributes (
        details_id int8 not null,
        access_type varchar(255),
        data_type varchar(255),
        name varchar(255) not null,
        primary key (details_id, name),
        unique (details_id, name)
    );

    create table gf_layer_custom_props (
        details_id int8 not null,
        propvalue varchar(255),
        propkey varchar(255),
        primary key (details_id, propkey)
    );

    create table gf_layer_details (
        id int8 not null,
        area public.geometry,
        cqlFilterRead varchar(4000),
        cqlFilterWrite varchar(4000),
        defaultStyle varchar(255),
        catalog_mode varchar(255),
		type varchar(255),
        rule_id int8 not null,
        primary key (id),
        unique (rule_id)
    );

    create table gf_layer_styles (
        details_id int8 not null,
        styleName varchar(255)
    );

    create table gf_rule (
        id int8 not null,
        grant_type varchar(255) not null,
		ip_high bigint,
		ip_low bigint,
		ip_size integer,
        layer varchar(255),
        priority int8 not null,
        request varchar(255),
        service varchar(255),
        workspace varchar(255),
        gsuser_id int8,
        instance_id int8,
        userGroup_id int8,
        primary key (id),
        unique (gsuser_id, userGroup_id, instance_id, service, request, workspace, layer)
    );

    create table gf_rule_limits (
        id int8 not null,
        area public.geometry,
		catalog_mode varchar(255),
        rule_id int8 not null,
        primary key (id),
        unique (rule_id)
    );

	------- VIEW gf_gsuser -------
	create or replace view geofence.gf_gsuser as
		select gs_user.id, 
				current_timestamp as datecreation, 
				character varying(255)'' as emailaddress, 
				character varying(255) '' as extid, 
				character varying(255) '' as fullname, 
				-- the password used here is: "This_is_an_AES_hardcoded_password" (note that it is also base64 encoded)
				gs_user.name, character varying(255) 'SWsIywoxKmqlGSjVedSqrpYd4/HBBn0pV+NmEEtta1T/do0NQNH6PM4Auj8EpwvX' as password,
				cast(gs_user.enabled as boolean), 
				case 
					when user_role='ADMIN' 
						then true 
						else false 
					end 
				as admin
		from geostore.gs_user;
   
	------- VIEW gf_user_usergroups -------
	create or replace view geofence.gf_user_usergroups as
		select gs_usergroup_members.user_id, 
				gs_usergroup_members.group_id
		from geostore.gs_usergroup_members;
   
	------- VIEW gf_usergroup -------
	create or replace view geofence.gf_usergroup as
		select gs_usergroup.id, 
				timestamp without time zone '0001-01-01 00:00:00' as datecreation, 
				cast(gs_usergroup.enabled as boolean), 
				character varying(255)'' as extid, 
				gs_usergroup.groupname as name
		from geostore.gs_usergroup;
	
	
    alter table gf_layer_attributes
        add constraint fk_attribute_layer
        foreign key (details_id)
        references gf_layer_details;

    alter table gf_layer_custom_props
        add constraint fk_custom_layer
        foreign key (details_id)
        references gf_layer_details;

    alter table gf_layer_details
        add constraint fk_details_rule
        foreign key (rule_id)
        references gf_rule;

    alter table gf_layer_styles
        add constraint fk_styles_layer
        foreign key (details_id)
        references gf_layer_details;

    create index idx_rule_request on gf_rule (request);

    create index idx_rule_layer on gf_rule (layer);

    create index idx_rule_service on gf_rule (service);

    create index idx_rule_workspace on gf_rule (workspace);

    create index idx_rule_priority on gf_rule (priority);

    alter table gf_rule
        add constraint fk_rule_instance
        foreign key (instance_id)
        references gf_gsinstance;

    alter table gf_rule_limits
        add constraint fk_limits_rule
        foreign key (rule_id)
        references gf_rule;

    create sequence hibernate_sequence;

--GRANTS
alter table gf_gfuser owner to geostore;
alter table gf_rule_limits owner to geostore;
alter table gf_layer_styles owner to geostore;
alter table gf_layer_custom_props owner to geostore;
alter table gf_layer_attributes owner to geostore;
alter table gf_layer_details owner to geostore;
alter table gf_rule owner to geostore;
alter table gf_gsinstance owner to geostore;
alter view gf_gsuser owner to geostore;
alter view gf_user_usergroups owner to geostore;
alter view geofence.gf_usergroup owner to geostore;

alter sequence hibernate_sequence owner to geostore;

--DEFAULTS
insert into geofence.gf_gfuser(id, datecreation, emailaddress, enabled, extid, fullname, "name", "password") values (0, 'now', null, true, 0, 'admin', 'admin', '21232f297a57a5a743894ae4a801fc3');