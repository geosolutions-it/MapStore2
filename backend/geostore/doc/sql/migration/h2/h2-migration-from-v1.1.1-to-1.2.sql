-- Update the geostore database from 1.1 model to 1.2
-- It adds the support to multiple usergroups that can be associated to an user.
-- It also adds the new field "enabled" in gs_user and gs_usergroups and it insert by default the Group EVERYONE and user GUEST materialized
-- It add one more table: the many2many relation table between use and usergroup table
--      and creates the related the related foreign keys.

-- The script assumes that the tables are located into the schema called "geostore" 
--      if not find/replace geostore. with <yourschemaname>.

-- Run the script with an unprivileged application user allowed to work on schema geostore

alter table gs_user add column enabled char(1) NOT NULL DEFAULT 'Y';
alter table gs_usergroup add column description varchar(200);
alter table gs_usergroup add column enabled char(1) NOT NULL DEFAULT 'Y';
create table gs_usergroup_members (user_id int8 not null, group_id int8 not null, primary key (user_id, group_id));

alter table gs_usergroup_members add constraint FKFDE460DB62224F72 foreign key (user_id) references gs_user;
alter table gs_usergroup_members add constraint FKFDE460DB9EC981B7 foreign key (group_id) references gs_usergroup;

INSERT INTO gs_usergroup(groupname, description, enabled) VALUES ('everyone', 'description', 'Y');
INSERT INTO gs_user(name, user_role, enabled) VALUES ('guest', 'GUEST', 'Y');

INSERT INTO gs_security(id,canread,canwrite,group_id,resource_id)
SELECT true,false,(SELECT id FROM gs_usergroup WHERE groupname='everyone'),gs_resource.id
FROM gs_resource INNER JOIN gs_category ON gs_resource.category_id=gs_category.id
WHERE gs_category.name='MAP';

INSERT INTO gs_usergroup_members(user_id, group_id) SELECT gsuser.id, gsgroup.id FROM gs_user AS gsuser, gs_usergroup AS gsgroup 
WHERE gsuser.user_role='GUEST' AND gsgroup.groupname='everyone';