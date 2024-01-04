use std::collections::HashMap;

use async_graphql::{dataloader::DataLoader, ComplexObject, Context, InputObject, SimpleObject};
use chrono::{DateTime, Utc};
use itertools::Itertools;
use sqlx::PgConnection;

use crate::{
    scalar::{BlocksByPostId, PostId, TagId, TagsByPostId, UserId},
    VerbandLoader,
};

use super::{Block, Tag, User};

#[derive(Clone, SimpleObject)]
#[graphql(complex)]
pub struct Post {
    pub(crate) id: PostId,
    pub(crate) creator_id: UserId,
    title: String,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

#[derive(InputObject)]
pub struct PostCreateInput {
    pub(crate) title: String,
    pub(crate) tag_ids: Vec<TagId>,
}

pub struct PostCreateData {
    pub(crate) title: String,
    pub(crate) creator_id: UserId,
    pub(crate) tag_ids: Vec<TagId>,
}

#[derive(InputObject)]
pub struct PostUpdateInput {
    pub(crate) title: String,
    pub(crate) tag_ids: Vec<TagId>,
}

pub struct PostUpdateData {
    pub(crate) title: String,
    pub(crate) tag_ids: Vec<TagId>,
}

impl Post {
    pub async fn find_all(conn: &mut PgConnection) -> anyhow::Result<Vec<Post>> {
        Ok(sqlx::query_as!(
            Post,
            "SELECT id, creator_id, title, created_at, updated_at FROM posts"
        )
        .fetch_all(&mut *conn)
        .await?)
    }

    pub async fn find_by_ids(conn: &mut PgConnection, ids: &[PostId]) -> anyhow::Result<Vec<Post>> {
        Ok(sqlx::query_as!(
            Post,
            "SELECT id, creator_id, title, created_at, updated_at FROM posts WHERE id = ANY($1)",
            ids as &[PostId]
        )
        .fetch_all(&mut *conn)
        .await?)
    }

    pub async fn find_by_creator_ids(
        conn: &mut PgConnection,
        creator_ids: &[UserId],
    ) -> anyhow::Result<Vec<Post>> {
        Ok(sqlx::query_as!(
            Post,
            "SELECT id, creator_id, title, created_at, updated_at FROM posts WHERE creator_id = ANY($1)",
            creator_ids as &[UserId]
        )
        .fetch_all(&mut *conn)
        .await?)
    }

    pub async fn search_by_tag_ids(
        conn: &mut PgConnection,
        tag_ids: &[TagId],
    ) -> anyhow::Result<Vec<Post>> {
        if tag_ids.is_empty() {
            return Post::find_all(conn).await;
        }

        let tag_ids = tag_ids.into_iter().map(|id| id.0).collect::<Vec<_>>();

        let tag_ids_by_post_id: HashMap<PostId, Vec<TagId>> = sqlx::query!(
            "SELECT p.id AS post_id, t.id AS tag_id
            FROM posts p
            JOIN post_tags pt ON p.id = pt.post_id
            JOIN tags t ON t.id = pt.tag_id
            WHERE t.id = ANY($1)",
            &tag_ids
        )
        .fetch_all(&mut *conn)
        .await?
        .into_iter()
        .map(|tp| (PostId(tp.post_id), TagId(tp.tag_id)))
        .group_by(|(post_id, _)| *post_id)
        .into_iter()
        .map(|(post_id, tag_ids)| {
            (
                post_id,
                tag_ids.map(|(_, tag_id)| tag_id).collect::<Vec<_>>(),
            )
        })
        .collect();

        let post_ids: Vec<PostId> = tag_ids_by_post_id
            .into_iter()
            .filter(|(_, post_tag_ids)| post_tag_ids.len() == tag_ids.len())
            .map(|(post_id, _)| post_id)
            .collect();

        Ok(Post::find_by_ids(conn, &post_ids).await?)
    }

    pub async fn create(conn: &mut PgConnection, data: &PostCreateData) -> anyhow::Result<Post> {
        let post = sqlx::query_as!(
            Post,
            "INSERT INTO posts (title, creator_id) VALUES ($1, $2)
            RETURNING id, creator_id, title, created_at, updated_at",
            data.title,
            data.creator_id.0
        )
        .fetch_one(&mut *conn)
        .await?;
        for tag_id in &data.tag_ids {
            sqlx::query!(
                "INSERT INTO post_tags (post_id, tag_id) VALUES ($1, $2)",
                post.id.0,
                tag_id.0
            )
            .execute(&mut *conn)
            .await?;
        }
        Ok(post)
    }

    pub async fn update(
        conn: &mut PgConnection,
        id: PostId,
        data: &PostUpdateData,
    ) -> anyhow::Result<Post> {
        let post = sqlx::query_as!(
            Post,
            "UPDATE posts SET title = $1 WHERE id = $2
            RETURNING id, creator_id, title, created_at, updated_at",
            data.title,
            id as PostId
        )
        .fetch_one(&mut *conn)
        .await?;
        sqlx::query!("DELETE FROM post_tags WHERE post_id = $1", id as PostId)
            .execute(&mut *conn)
            .await?;
        for tag_id in &data.tag_ids {
            sqlx::query!(
                "INSERT INTO post_tags (post_id, tag_id) VALUES ($1, $2)",
                post.id as PostId,
                *tag_id as TagId
            )
            .execute(&mut *conn)
            .await?;
        }
        Ok(post)
    }
}

#[ComplexObject]
impl Post {
    async fn blocks(&self, ctx: &Context<'_>) -> async_graphql::Result<Vec<Block>> {
        let dataloader = ctx.data::<DataLoader<VerbandLoader>>()?;
        let blocks = dataloader
            .load_one(BlocksByPostId(self.id))
            .await?
            .ok_or_else(|| async_graphql::Error::new("Error while fetching blocks for post."))?;
        Ok(blocks)
    }

    async fn tags(&self, ctx: &Context<'_>) -> async_graphql::Result<Vec<Tag>> {
        let dataloader = ctx.data::<DataLoader<VerbandLoader>>()?;
        let tags = dataloader
            .load_one(TagsByPostId(self.id))
            .await?
            .ok_or_else(|| async_graphql::Error::new("Error while fetching tags for post."))?;
        Ok(tags)
    }

    async fn creator(&self, ctx: &Context<'_>) -> async_graphql::Result<User> {
        let dataloader = ctx.data::<DataLoader<VerbandLoader>>()?;
        let creator = dataloader
            .load_one(self.creator_id)
            .await?
            .ok_or_else(|| async_graphql::Error::new("Error while fetching creator for post."))?;
        Ok(creator)
    }
}
