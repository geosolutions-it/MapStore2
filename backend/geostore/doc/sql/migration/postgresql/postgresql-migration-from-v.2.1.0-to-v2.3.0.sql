-- Tags
create table gs_tag (
    id int8 not null,
    color varchar(255) not null,
    description varchar(255) null,
    "name" varchar(255) not null,
    constraint gs_tag_pkey primary key (id),
    constraint gs_tag_name_unique unique (name)
);

create table gs_resource_tags (
    tag_id int8 not null,
    resource_id int8 not null,
    constraint gs_resource_tags_pkey primary key (tag_id, resource_id)
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

-- Favorites
create table gs_user_favorites (
    user_id int8 not null,
    resource_id int8 not null,
    constraint gs_user_favorites_pkey primary key (user_id, resource_id)
);

alter table gs_user_favorites
    add constraint fk_user_favorites_resource
    foreign key (resource_id)
    references gs_resource(id)
    on delete cascade;

alter table gs_user_favorites
    add constraint fk_user_favorites_user
    foreign key (user_id)
    references gs_user(id);