use async_graphql::{Context, Object};
use sqlx::PgPool;

use crate::model::Tag;

#[derive(Default)]
pub struct TagQuery;

#[Object]
impl TagQuery {
    async fn tags_all(&self, ctx: &Context<'_>) -> async_graphql::Result<Vec<Tag>> {
        let pool = ctx.data::<PgPool>()?;
        let mut conn = pool.acquire().await?;
        Ok(Tag::find_all(&mut conn).await?)
    }
}
