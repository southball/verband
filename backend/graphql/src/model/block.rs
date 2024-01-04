use async_graphql::{dataloader::DataLoader, ComplexObject, Context, SimpleObject};
use chrono::{DateTime, Utc};
use sqlx::PgConnection;

use crate::{
    scalar::{BlockId, BlockVersionId, BlockVersionsByBlockId, PostId},
    VerbandLoader,
};

use super::BlockVersion;

#[derive(Clone, SimpleObject)]
#[graphql(complex)]
pub struct Block {
    pub(crate) id: BlockId,
    pub(crate) post_id: PostId,
    latest_block_version_id: Option<BlockVersionId>,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

impl Block {
    pub async fn find_by_ids(
        conn: &mut PgConnection,
        ids: &[BlockId],
    ) -> async_graphql::Result<Vec<Block>> {
        Ok(sqlx::query_as!(Block, r#"SELECT id, post_id, latest_block_version_id AS "latest_block_version_id: BlockVersionId", created_at, updated_at FROM blocks WHERE id = ANY($1)"#, ids as &[BlockId])
            .fetch_all(&mut *conn)
            .await?)
    }

    pub async fn find_by_post_ids(
        conn: &mut PgConnection,
        post_ids: &[PostId],
    ) -> async_graphql::Result<Vec<Block>> {
        Ok(sqlx::query_as!(Block, r#"SELECT id, post_id, latest_block_version_id AS "latest_block_version_id: BlockVersionId", created_at, updated_at FROM blocks WHERE post_id = ANY($1)"#, post_ids as &[PostId])
            .fetch_all(&mut *conn)
            .await?)
    }

    pub async fn create(conn: &mut PgConnection, post_id: PostId) -> async_graphql::Result<Block> {
        Ok(sqlx::query_as!(Block, r#"INSERT INTO blocks (post_id) VALUES ($1) RETURNING id, post_id, latest_block_version_id AS "latest_block_version_id: BlockVersionId", created_at, updated_at"#, post_id as PostId)
            .fetch_one(&mut *conn)
            .await?)
    }

    pub async fn update(
        conn: &mut PgConnection,
        id: BlockId,
        latest_block_version_id: BlockVersionId,
    ) -> async_graphql::Result<Block> {
        Ok(sqlx::query_as!(Block, r#"UPDATE blocks SET latest_block_version_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, post_id, latest_block_version_id AS "latest_block_version_id: BlockVersionId", created_at, updated_at"#, latest_block_version_id as BlockVersionId, id as BlockId)
            .fetch_one(&mut *conn)
            .await?)
    }
}

#[ComplexObject]
impl Block {
    async fn all_block_versions(
        &self,
        ctx: &Context<'_>,
    ) -> async_graphql::Result<Vec<BlockVersion>> {
        let dataloader = ctx.data::<DataLoader<VerbandLoader>>()?;

        let block_versions = dataloader
            .load_one(BlockVersionsByBlockId(self.id))
            .await?
            .ok_or_else(|| {
                async_graphql::Error::new("Error while fetching block versions for block.")
            })?;

        Ok(block_versions)
    }

    async fn latest_block_version(&self, ctx: &Context<'_>) -> async_graphql::Result<BlockVersion> {
        let dataloader = ctx.data::<DataLoader<VerbandLoader>>()?;

        let block_version = dataloader
            .load_one(self.latest_block_version_id.ok_or_else(|| {
                async_graphql::Error::new("Error while fetching latest block version for block.")
            })?)
            .await?
            .ok_or_else(|| {
                async_graphql::Error::new("Error while fetching latest block version for block.")
            })?;

        Ok(block_version)
    }
}
