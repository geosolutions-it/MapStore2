-- Update the geostore database from 1.1 model to 1.2
-- It adds the support to multiple usergroups that can be associated to an user.
-- It also adds the new field "enabled" in gs_user and gs_usergroups and it insert by default the Group EVERYONE and user GUEST materialized
-- It add one more table: the many2many relation table between use and usergroup table
--      and creates the related the related foreign keys.

-- The script assumes that the tables are located into the schema called "geostore" 
--      if not find/replace geostore. with <yourschemaname>.

-- Tested with Oracle 11g

-- Run the script with an unprivileged application user allowed to work on schema geostore

ALTER TABLE gs_user ADD enabled char(1) DEFAULT 'Y' NOT NULL ;
ALTER TABLE gs_usergroup ADD description varchar2(200 char);
ALTER TABLE gs_usergroup ADD enabled char(1) DEFAULT 'Y' NOT NULL ;

CREATE TABLE gs_usergroup_members (user_id number(19,0) not null, group_id number(19,0) not null, primary key (user_id, group_id));

ALTER TABLE gs_usergroup_members ADD CONSTRAINT FKFDE460DB62224F72 FOREIGN KEY (user_id) REFERENCES gs_user;
ALTER TABLE gs_usergroup_members ADD CONSTRAINT FKFDE460DB9EC981B7 FOREIGN KEY (group_id) REFERENCES gs_usergroup;

INSERT INTO gs_usergroup(id, groupname, description, enabled) VALUES (hibernate_sequence.nextval,'everyone', 'description', 'Y');
INSERT INTO gs_user(id, name, user_role, enabled) VALUES (hibernate_sequence.nextval,'guest', 'GUEST', 'Y');

INSERT INTO gs_security(id,canread,canwrite,group_id,resource_id)
SELECT hibernate_sequence.nextval,1,0,(SELECT id FROM gs_usergroup WHERE groupname='everyone'),gs_resource.id
FROM gs_resource INNER JOIN gs_category ON gs_resource.category_id=gs_category.id
WHERE gs_category.name='MAP';

INSERT INTO gs_usergroup_members(user_id, group_id) SELECT gsuser.id, gsgroup.id FROM gs_user gsuser, gs_usergroup gsgroup 
WHERE gsuser.user_role='GUEST' AND gsgroup.groupname='everyone';