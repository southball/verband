use async_graphql::{Context, Object};
use sqlx::PgPool;

use crate::{
    guard::UserAnyGuard,
    model::Post,
    scalar::{PostId, TagId},
};

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

    #[graphql(guard = "UserAnyGuard")]
    async fn posts_search(
        &self,
        ctx: &Context<'_>,
        query: String,
    ) -> async_graphql::Result<Vec<Post>> {
        let pool = ctx.data::<PgPool>()?;
        let meilisearch = ctx.data::<meilisearch_sdk::Client>()?;

        let ids = meilisearch
            .index("posts")
            .search()
            .with_query(&query)
            .execute::<serde_json::Value>()
            .await?
            .hits
            .into_iter()
            .filter_map(|value| Some(PostId(value.result.get("id")?.as_i64()?)))
            .collect::<Vec<_>>();

        let mut conn = pool.acquire().await?;
        Ok(Post::find_by_ids(&mut conn, &ids).await?)
    }
}
