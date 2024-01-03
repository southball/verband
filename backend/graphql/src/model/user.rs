use async_graphql::{InputObject, SimpleObject};
use chrono::{DateTime, Utc};
use sqlx::PgConnection;

use crate::scalar::UserId;

#[derive(SimpleObject)]
pub struct User {
    pub(crate) id: UserId,
    pub(crate) handle_name: String,
    pub(crate) display_name: String,
    #[graphql(skip)]
    pub(crate) password_hash: String,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

pub struct UserCreateData {
    pub(crate) handle_name: String,
    pub(crate) display_name: String,
    pub(crate) password_hash: String,
}

#[derive(InputObject)]
pub struct UserUpdateInput {
    pub(crate) handle_name: Option<String>,
    pub(crate) display_name: Option<String>,
    pub(crate) password_hash: Option<String>,
}

pub struct UserUpdateData {
    pub(crate) handle_name: String,
    pub(crate) display_name: String,
    pub(crate) password_hash: String,
}

impl User {
    pub async fn find_by_handle_name(
        conn: &mut PgConnection,
        handle_name: &str,
    ) -> anyhow::Result<Option<User>> {
        Ok(sqlx::query_as!(User, "SELECT id, handle_name, display_name, password_hash, created_at, updated_at FROM users WHERE handle_name = $1", &handle_name)
        .fetch_optional(&mut *conn)
        .await?)
    }

    pub async fn find_by_ids(conn: &mut PgConnection, ids: &[UserId]) -> anyhow::Result<Vec<User>> {
        let ids = ids.into_iter().map(|id| id.0).collect::<Vec<_>>();
        Ok(sqlx::query_as!(User, "SELECT id, handle_name, display_name, password_hash, created_at, updated_at FROM users WHERE id = ANY($1)", &ids)
        .fetch_all(&mut *conn)
        .await?)
    }

    pub async fn create(conn: &mut PgConnection, data: &UserCreateData) -> anyhow::Result<User> {
        Ok(sqlx::query_as!(
            User,
            "INSERT INTO users (handle_name, display_name, password_hash) VALUES ($1, $2, $3)
            RETURNING id, handle_name, display_name, password_hash, created_at, updated_at",
            data.handle_name,
            data.display_name,
            data.password_hash
        )
        .fetch_one(&mut *conn)
        .await?)
    }

    pub async fn update(
        conn: &mut PgConnection,
        id: UserId,
        data: &UserUpdateData,
    ) -> anyhow::Result<User> {
        Ok(sqlx::query_as!(
            User,
            "UPDATE users
            SET handle_name = $2, display_name = $3, password_hash = $4
            WHERE id = $1
            RETURNING id, handle_name, display_name, password_hash, created_at, updated_at",
            id.0,
            data.handle_name,
            data.display_name,
            data.password_hash
        )
        .fetch_one(&mut *conn)
        .await?)
    }
}
