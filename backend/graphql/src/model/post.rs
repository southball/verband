use async_graphql::SimpleObject;
use chrono::{DateTime, Utc};
use sqlx::PgConnection;

use crate::scalar::{PostId, UserId};

#[derive(Clone, SimpleObject)]
pub struct Post {
    pub(crate) id: PostId,
    creator_id: UserId,
    title: String,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
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
        let ids = ids.into_iter().map(|id| id.0).collect::<Vec<_>>();
        Ok(sqlx::query_as!(
            Post,
            "SELECT id, creator_id, title, created_at, updated_at FROM posts WHERE id = ANY($1)",
            &ids
        )
        .fetch_all(&mut *conn)
        .await?)
    }
}
