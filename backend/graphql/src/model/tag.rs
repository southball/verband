use std::collections::HashMap;

use async_graphql::{InputObject, SimpleObject};
use sqlx::PgConnection;

use crate::scalar::{PostId, TagId};

#[derive(Clone, SimpleObject)]
pub struct Tag {
    pub(crate) id: TagId,
    name: String,
}

#[derive(InputObject)]
pub struct TagCreateInput {
    pub(crate) name: String,
}

pub struct TagCreateData {
    pub(crate) name: String,
}

#[derive(InputObject)]
pub struct TagUpdateInput {
    pub(crate) name: String,
}

pub struct TagUpdateData {
    pub(crate) name: String,
}

impl Tag {
    pub async fn find_all(conn: &mut PgConnection) -> async_graphql::Result<Vec<Tag>> {
        Ok(sqlx::query_as!(Tag, "SELECT id, name FROM tags")
            .fetch_all(&mut *conn)
            .await?)
    }

    pub async fn find_by_ids(
        conn: &mut PgConnection,
        ids: &[TagId],
    ) -> async_graphql::Result<Vec<Tag>> {
        Ok(sqlx::query_as!(
            Tag,
            "SELECT id, name FROM tags WHERE id = ANY($1)",
            ids as &[TagId]
        )
        .fetch_all(&mut *conn)
        .await?)
    }

    pub async fn find_for_post_ids(
        conn: &mut PgConnection,
        post_ids: &[PostId],
    ) -> async_graphql::Result<HashMap<PostId, Vec<Tag>>> {
        let post_tags = sqlx::query!(
            "SELECT post_id, tag_id FROM post_tags WHERE post_id = ANY($1)",
            post_ids as &[PostId]
        )
        .fetch_all(&mut *conn)
        .await?;

        let tag_ids = post_tags
            .iter()
            .map(|post_tag| TagId(post_tag.tag_id))
            .collect::<Vec<TagId>>();
        let tags = Tag::find_by_ids(&mut *conn, &tag_ids)
            .await?
            .into_iter()
            .map(|tag| (tag.id, tag))
            .collect::<HashMap<TagId, Tag>>();

        let mut tags_by_post_id = HashMap::new();

        for post_tag in post_tags {
            let post_id = PostId(post_tag.post_id);
            let tag_id = TagId(post_tag.tag_id);

            tags_by_post_id
                .entry(post_id)
                .or_insert_with(Vec::new)
                .push(tags.get(&tag_id).unwrap().clone());
        }

        Ok(tags_by_post_id)
    }

    pub async fn create(
        conn: &mut PgConnection,
        data: &TagCreateData,
    ) -> async_graphql::Result<Tag> {
        Ok(sqlx::query_as!(
            Tag,
            "INSERT INTO tags (name) VALUES ($1) RETURNING id, name",
            data.name
        )
        .fetch_one(&mut *conn)
        .await?)
    }

    pub async fn update(
        conn: &mut PgConnection,
        id: TagId,
        data: &TagUpdateData,
    ) -> async_graphql::Result<Tag> {
        Ok(sqlx::query_as!(
            Tag,
            "UPDATE tags SET name = $1 WHERE id = $2 RETURNING id, name",
            data.name,
            id.0
        )
        .fetch_one(&mut *conn)
        .await?)
    }
}
