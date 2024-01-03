use async_graphql::{Context, Object};
use sqlx::PgPool;

use crate::{guard::UserAnyGuard, model::Post};

#[derive(Default)]
pub struct PostQuery;

#[Object]
impl PostQuery {
    #[graphql(guard = "UserAnyGuard")]
    async fn posts_all(&self, ctx: &Context<'_>) -> async_graphql::Result<Vec<Post>> {
        let pool = ctx.data::<PgPool>()?;
        let mut conn = pool.acquire().await?;
        let posts = Post::find_all(&mut conn).await?;
        Ok(posts)
    }
}
