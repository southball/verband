use crate::{model::User, scalar::UserId};
use async_graphql::{Context, Object};
use sqlx::PgPool;
use tower_sessions::Session;

#[derive(Default)]
pub struct UserQuery;

#[Object]
impl UserQuery {
    async fn user_me(&self, ctx: &Context<'_>) -> async_graphql::Result<Option<User>> {
        let pool = ctx.data::<PgPool>()?;
        let mut conn = pool.acquire().await?;
        let session = ctx.data::<Session>()?;

        let Some(user_id) = session.get::<i64>("user_id")? else {
            return Ok(None);
        };

        let user = User::find_by_ids(&mut conn, &[UserId(user_id)])
            .await?
            .pop();

        Ok(user)
    }
}
