use async_graphql::{Context, Object};
use sqlx::PgPool;

use crate::{guard::UserAnyGuard, model::Block, scalar::BlockId};

#[derive(Default)]
pub struct BlockQuery;

#[Object]
impl BlockQuery {
    #[graphql(guard = "UserAnyGuard")]
    async fn blocks_by_ids(
        &self,
        ctx: &Context<'_>,
        ids: Vec<BlockId>,
    ) -> async_graphql::Result<Vec<Block>> {
        let pool = ctx.data::<PgPool>()?;
        let mut conn = pool.acquire().await?;
        Ok(Block::find_by_ids(&mut conn, &ids).await?)
    }

    #[graphql(guard = "UserAnyGuard")]
    async fn blocks_search(
        &self,
        ctx: &Context<'_>,
        query: String,
    ) -> async_graphql::Result<Vec<Block>> {
        let pool = ctx.data::<PgPool>()?;
        let meilisearch = ctx.data::<meilisearch_sdk::Client>()?;

        let ids = meilisearch
            .index("blocks")
            .search()
            .with_query(&query)
            .execute::<serde_json::Value>()
            .await?
            .hits
            .into_iter()
            .filter_map(|value| Some(BlockId(value.result.get("id")?.as_i64()?)))
            .collect::<Vec<_>>();

        let mut conn = pool.acquire().await?;
        Ok(Block::find_by_ids(&mut conn, &ids).await?)
    }
}
