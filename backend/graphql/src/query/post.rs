use async_graphql::{Context, Object};
use sqlx::PgPool;

use crate::{guard::UserAnyGuard, model::Post, scalar::TagId};

#[derive(Default)]
pub struct PostQuery;

#[Object]
impl PostQuery {
    #[graphql(guard = "UserAnyGuard")]
    async fn posts_by_tags(
        &self,
        ctx: &Context<'_>,
        tag_ids: Vec<TagId>,
    ) -> async_graphql::Result<Vec<Post>> {
        let pool = ctx.data::<PgPool>()?;
        let mut conn = pool.acquire().await?;
        Ok(Post::search_by_tag_ids(&mut conn, &tag_ids).await?)
    }
}
