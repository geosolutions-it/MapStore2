
    create table gs_attribute (
        id number(19,0) not null,
        attribute_date timestamp,
        name varchar2(255 char) not null,
        attribute_number double precision,
        attribute_text varchar2(255 char),
        attribute_type varchar2(255 char) not null,
        resource_id number(19,0) not null,
        primary key (id),
        unique (name, resource_id)
    );

    create table gs_category (
        id number(19,0) not null,
        name varchar2(255 char) not null,
        primary key (id),
        unique (name)
    );

    create table gs_resource (
        id number(19,0) not null,
        creation timestamp not null,
        description varchar2(10000 char),
        lastUpdate timestamp,
        metadata varchar2(4000 char),
        name varchar2(255 char) not null,
        category_id number(19,0) not null,
        creator varchar2(255 char),
        editor varchar2(255 char),
        advertised bool not null default true,
        stored_data_id number(19,0),
        primary key (id),
        unique (name),
        unique (stored_data_id)
    );

    create table gs_security (
        id number(19,0) not null,
        canRead number(1,0) not null,
        canWrite number(1,0) not null,
        group_id number(19,0),
        resource_id number(19,0),
        user_id number(19,0),
        username varchar2(255 char),
        groupname varchar2(255 char),
        primary key (id),
        unique (user_id, resource_id),
        unique (resource_id, group_id)
    );

    create table gs_stored_data (
        id number(19,0) not null,
        stored_data CLOB not null,
        primary key (id)
    );

    create table gs_user (
        id number(19,0) not null,
        name varchar2(255 char) not null,
        user_password varchar2(255 char),
        user_role varchar2(255 char) not null,
        group_id number(19,0),
		enabled char(1) NOT NULL DEFAULT 'Y',
        primary key (id),
        unique (name)
    );

    create table gs_user_attribute (
        id number(19,0) not null,
        name varchar2(255 char) not null,
        string varchar2(255 char),
        user_id number(19,0) not null,
        primary key (id),
        unique (name, user_id)
    );

    create table gs_user_group_attribute (
              id number(19,0) not null,
              name varchar2(255 char) not null,
              string varchar2(255 char),
              userGroup_id number(19,0) not null,
              primary key (id)
    );

    create table gs_usergroup (
        id number(19,0) not null,
        groupName varchar2(255 char) not null,
		description varchar2(255 char),
		enabled char(1) NOT NULL DEFAULT 'Y',
        primary key (id),
        unique (groupName)
    );
	
	create table gs_usergroup_members (
		user_id number(19,0) not null, 
		group_id number(19,0) not null, 
		primary key (user_id, group_id)
	);

    alter table gs_usergroup_members 
		add constraint FKFDE460DB62224F72 
		foreign key (user_id) 
		references gs_user;
		
    alter table gs_usergroup_members 
		add constraint FKFDE460DB9EC981B7 
		foreign key (group_id) 
		references gs_usergroup;

    create table gs_tag (
    	id number(19,0) not null,
    	color varchar2(255 char) not null,
    	description varchar2(255 char),
    	"name" varchar2(255 char) not null,
    	primary key (id)
    );

    create table gs_resource_tags (
    	tag_id number(19,0) not null,
    	resource_id number(19,0) not null,
    	primary key (tag_id, resource_id)
    );

    alter table gs_resource_tags
        add constraint fk_resource_tags_resource
        foreign key (resource_id)
        references gs_resource(id)
        on delete cascade;

    alter table gs_resource_tags
        add constraint fk_resource_tags_tag
        foreign key (tag_id)
        references gs_tag(id);

    create table gs_user_favorites (
        id number(19) not null,
        resource_id number(19) not null,
        username varchar2(255 char),
        user_id number(19),

        constraint gs_user_favorites_check
           check (
               (user_id is not null and username is null)
                   or
               (user_id is null and username is not null)
               ),

        constraint gs_user_favorites_pk
           primary key (id),

        constraint gs_user_favorites_unique_user_id
           unique (user_id, resource_id),

        constraint gs_user_favorites_unique_username
           unique (resource_id, username),

        constraint gs_user_favorites_resource_fk
           foreign key (resource_id)
               references gs_resource(id)
               on delete cascade,

        constraint gs_user_favorites_user_fk
           foreign key (user_id)
               references gs_user(id)
               on delete cascade,
    );

    create table gs_ip_range (
        id number(19,0) not null,
        cidr varchar2(50 char) not null,
        description varchar2(255 char),
        ip_low number(39,0) not null,
        ip_high number(39,0) not null,
        constraint gs_ip_range_pkey primary key (id)
    );
    create index idx_ip_range_lookup on gs_ip_range(ip_low, ip_high);

    create table gs_security_ip_range (
        security_id number(19,0) not null,
        ip_range_id number(19,0) not null,
        constraint gs_security_ip_range_unique_security_id_ip_range_id unique (security_id, ip_range_id),
        constraint fk_gs_security foreign key (security_id) references gs_security(id),
        constraint fk_gs_ip_range foreign key (ip_range_id) references gs_ip_range(id)
    );

    create index idx_security_ip_range_ip_range_id on gs_security_ip_range (ip_range_id);
    create index idx_security_ip_range_security_id on gs_security_ip_range (security_id);

    create index idx_attribute_name on gs_attribute (name);

    create index idx_attribute_resource on gs_attribute (resource_id);

    create index idx_attribute_text on gs_attribute (attribute_text);

    create index idx_attribute_type on gs_attribute (attribute_type);

    create index idx_attribute_date on gs_attribute (attribute_date);

    create index idx_attribute_number on gs_attribute (attribute_number);

    alter table gs_attribute 
        add constraint fk_attribute_resource 
        foreign key (resource_id) 
        references gs_resource;

    create index idx_category_type on gs_category (name);

    create index idx_resource_name on gs_resource (name);

    create index idx_resource_description on gs_resource (description);

    create index idx_resource_metadata on gs_resource (metadata);

    create index idx_resource_update on gs_resource (lastUpdate);

    create index idx_resource_creation on gs_resource (creation);

    create index idx_resource_category on gs_resource (category_id);

    alter table gs_resource 
        add constraint fk_resource_category 
        foreign key (category_id) 
        references gs_category;

    create index idx_security_resource on gs_security (resource_id);

    create index idx_security_user on gs_security (user_id);

    create index idx_security_group on gs_security (group_id);

    create index idx_security_write on gs_security (canWrite);

    create index idx_security_read on gs_security (canRead);
    
    create index idx_security_username on gs_security (username);
    
    create index idx_security_groupname on gs_security (groupname);

    alter table gs_security 
        add constraint fk_security_user 
        foreign key (user_id) 
        references gs_user;

    alter table gs_security 
        add constraint fk_security_group 
        foreign key (group_id) 
        references gs_usergroup;

    alter table gs_security 
        add constraint fk_security_resource 
        foreign key (resource_id) 
        references gs_resource;

    alter table gs_resource
        add constraint fk_resource_stored_data
        foreign key (stored_data_id)
        references gs_stored_data;

    create index idx_user_group on gs_user (group_id);

    create index idx_user_password on gs_user (user_password);

    create index idx_user_name on gs_user (name);

    create index idx_user_role on gs_user (user_role);

    alter table gs_user 
        add constraint fk_user_ugroup 
        foreign key (group_id) 
        references gs_usergroup;

    create index idx_user_attribute_name on gs_user_attribute (name);

    create index idx_user_attribute_text on gs_user_attribute (string);

    create index idx_attribute_user on gs_user_attribute (user_id);

    alter table gs_user_attribute 
        add constraint fk_uattrib_user 
        foreign key (user_id) 
        references gs_user;

    create index idx_user_group_attr_name on gs_user_group_attribute (name);

    create index idx_user_group_attr_text on gs_user_group_attribute (string);

    create index idx_attr_user_group on gs_user_group_attribute (userGroup_id);

    alter table gs_user_group_attribute add constraint fk_ugattrib_user_group foreign key (userGroup_id) references gs_usergroup;

    create index idx_usergroup_name on gs_usergroup (groupName);

    create sequence hibernate_sequence;
