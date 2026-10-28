-- Tags
CREATE TABLE gs_tag (
    id BIGINT NOT NULL,
    color VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    CONSTRAINT gs_tag_pkey PRIMARY KEY (id),
    CONSTRAINT gs_tag_name_unique UNIQUE (name)
);

CREATE TABLE gs_resource_tags (
    tag_id BIGINT NOT NULL,
    resource_id BIGINT NOT NULL,
    CONSTRAINT gs_resource_tags_pkey PRIMARY KEY (tag_id, resource_id)
);

ALTER TABLE gs_resource_tags
    ADD CONSTRAINT fk_resource_tags_resource
    FOREIGN KEY (resource_id)
    REFERENCES gs_resource(id)
    ON DELETE CASCADE;

-- Favorites
CREATE TABLE gs_user_favorites (
    user_id BIGINT NOT NULL,
    resource_id BIGINT NOT NULL,
    CONSTRAINT gs_user_favorites_pkey PRIMARY KEY (user_id, resource_id)
);

ALTER TABLE gs_user_favorites
    ADD CONSTRAINT fk_user_favorites_resource
    FOREIGN KEY (resource_id)
    REFERENCES gs_resource(id)
    ON DELETE CASCADE;

ALTER TABLE gs_user_favorites
    ADD CONSTRAINT fk_user_favorites_user
    FOREIGN KEY (user_id)
    REFERENCES gs_user(id);