use async_graphql::{dataloader::DataLoader, ComplexObject, Context, InputObject, SimpleObject};
use chrono::{DateTime, Utc};
use sqlx::PgConnection;

use crate::{
    scalar::{BlockId, BlockVersionId, UserId},
    VerbandLoader,
};

use super::User;

#[derive(Clone, SimpleObject)]
#[graphql(complex)]
pub struct BlockVersion {
    pub(crate) id: BlockVersionId,
    pub(crate) block_id: BlockId,
    parent_block_version_id: Option<BlockVersionId>,
    creator_id: UserId,
    content_type: String,
    pub(crate) content: String,
    pub(crate) metadata: String,
    created_at: DateTime<Utc>,
}

#[derive(InputObject)]
pub struct BlockVersionCreateInput {
    pub(crate) content_type: String,
    pub(crate) content: String,
    pub(crate) metadata: String,
}

pub struct BlockVersionCreateData {
    pub(crate) block_id: BlockId,
    pub(crate) parent_block_version_id: Option<BlockVersionId>,
    pub(crate) creator_id: UserId,
    pub(crate) content_type: String,
    pub(crate) content: String,
    pub(crate) metadata: String,
}

impl BlockVersion {
    pub async fn find_by_ids(
        conn: &mut PgConnection,
        ids: &[BlockVersionId],
    ) -> async_graphql::Result<Vec<BlockVersion>> {
        Ok(
            sqlx::query_as!(
                BlockVersion,
                r#"SELECT id, block_id, parent_block_version_id AS "parent_block_version_id: BlockVersionId", creator_id, content_type, content, metadata, created_at FROM block_versions WHERE id = ANY($1)"#,
                ids as &[BlockVersionId])
            .fetch_all(&mut *conn)
            .await?,
        )
    }

    pub async fn find_by_block_ids(
        conn: &mut PgConnection,
        block_ids: &[BlockId],
    ) -> async_graphql::Result<Vec<BlockVersion>> {
        Ok(
            sqlx::query_as!(
                BlockVersion,
                r#"SELECT id, block_id, parent_block_version_id AS "parent_block_version_id: BlockVersionId", creator_id, content_type, content, metadata, created_at FROM block_versions WHERE block_id = ANY($1)"#,
                block_ids as &[BlockId])
            .fetch_all(&mut *conn)
            .await?,
        )
    }

    pub async fn create(
        conn: &mut PgConnection,
        data: &BlockVersionCreateData,
    ) -> async_graphql::Result<BlockVersion> {
        Ok(
            sqlx::query_as!(
                BlockVersion,
                r#"INSERT INTO block_versions (block_id, parent_block_version_id, creator_id, content_type, content, metadata)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING id, block_id, parent_block_version_id AS "parent_block_version_id: BlockVersionId", creator_id, content_type, content, metadata, created_at"#,
                data.block_id as BlockId,
                data.parent_block_version_id as Option<BlockVersionId>,
                data.creator_id as UserId,
                data.content_type,
                data.content,
                data.metadata)
            .fetch_one(&mut *conn)
            .await?,
        )
    }
}

#[ComplexObject]
impl BlockVersion {
    pub async fn creator(&self, ctx: &Context<'_>) -> async_graphql::Result<User> {
        let dataloader = ctx.data::<DataLoader<VerbandLoader>>()?;

        let user = dataloader
            .load_one(self.creator_id)
            .await?
            .ok_or_else(|| async_graphql::Error::new("Error while fetching creator for post."))?;

        Ok(user)
    }
}
