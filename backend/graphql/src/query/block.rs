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
}
