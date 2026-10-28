create table gs_user_group_attribute (
              id number(19,0) not null,
              name varchar2(255 char) not null,
              string varchar2(255 char),
              userGroup_id number(19,0) not null,
              primary key (id)
    );



create index idx_user_group_attr_name on gs_user_group_attribute (name);

create index idx_user_group_attr_text on gs_user_group_attribute (string);

create index idx_attr_user_group on gs_user_group_attribute (userGroup_id);

alter table gs_user_group_attribute add constraint fk_ugattrib_user_group foreign key (userGroup_id) references gs_usergroup;
