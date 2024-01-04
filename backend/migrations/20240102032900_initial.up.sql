CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    handle_name TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE posts (
    id BIGSERIAL PRIMARY KEY,
    creator_id BIGINT NOT NULL REFERENCES users (id),
    title TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE blocks (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL REFERENCES posts (id),
    latest_block_version_id BIGINT, -- Foreign key added later
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE block_versions (
    id BIGSERIAL PRIMARY KEY,
    block_id BIGINT NOT NULL REFERENCES blocks (id),
    parent_block_version_id BIGINT REFERENCES block_versions (id) DEFERRABLE,
    creator_id BIGINT NOT NULL REFERENCES users (id),
    content_type TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE blocks ADD FOREIGN KEY (latest_block_version_id) REFERENCES block_versions (id);

CREATE TABLE tags (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE post_tags (
    post_id BIGINT NOT NULL REFERENCES posts (id),
    tag_id BIGINT NOT NULL REFERENCES tags (id),
    PRIMARY KEY (post_id, tag_id)
);
