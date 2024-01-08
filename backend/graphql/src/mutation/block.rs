use async_graphql::{Context, Object};
use sqlx::PgPool;
use tower_sessions::Session;

use crate::{
    event::{PostBlockCreatedEvent, PostBlockUpdatedEvent},
    model::{Block, BlockVersion, BlockVersionCreateData, BlockVersionCreateInput},
    scalar::{BlockId, BlockVersionId, PostId, UserId},
    VerbandEvent, VerbandEventSender,
};

#[derive(Default)]
pub struct BlockMutation;

#[Object]
impl BlockMutation {
    async fn block_create(
        &self,
        ctx: &Context<'_>,
        post_id: PostId,
        input: BlockVersionCreateInput,
    ) -> async_graphql::Result<Block> {
        let pool = ctx.data::<PgPool>()?;
        let session = ctx.data::<Session>()?;
        let sender = ctx.data::<VerbandEventSender>()?;
        let meilisearch = ctx.data::<meilisearch_sdk::Client>()?;

        let Some(user_id) = session.get::<i64>("user_id")? else {
            return Err(async_graphql::Error::new("Not logged in."));
        };

        let mut tx = pool.begin().await?;
        let block = Block::create(&mut tx, post_id).await?;
        let block_version = BlockVersion::create(
            &mut tx,
            &BlockVersionCreateData {
                block_id: block.id,
                parent_block_version_id: None,
                creator_id: UserId(user_id),
                content_type: input.content_type,
                content: input.content,
                metadata: input.metadata,
            },
        )
        .await?;
        let block = Block::update(&mut tx, block.id, block_version.id).await?;

        tx.commit().await?;

        meilisearch
            .index("blocks")
            .add_documents(
                &[Block::generate_searchable_object(&block, &block_version)],
                Some("id"),
            )
            .await?;

        sender.send(VerbandEvent::PostBlockCreated(PostBlockCreatedEvent {
            post_id: block.post_id,
            block_id: block.id,
        }))?;

        Ok(block)
    }

    async fn block_update(
        &self,
        ctx: &Context<'_>,
        block_id: BlockId,
        parent_block_version_id: BlockVersionId,
        input: BlockVersionCreateInput,
    ) -> async_graphql::Result<Block> {
        let pool = ctx.data::<PgPool>()?;
        let session = ctx.data::<Session>()?;
        let sender = ctx.data::<VerbandEventSender>()?;
        let meilisearch = ctx.data::<meilisearch_sdk::Client>()?;

        let Some(user_id) = session.get::<i64>("user_id")? else {
            return Err(async_graphql::Error::new("Not logged in."));
        };

        let mut tx = pool.begin().await?;
        let block_version = BlockVersion::create(
            &mut tx,
            &BlockVersionCreateData {
                block_id,
                parent_block_version_id: Some(parent_block_version_id),
                creator_id: UserId(user_id),
                content_type: input.content_type,
                content: input.content,
                metadata: input.metadata,
            },
        )
        .await?;
        let block = Block::update(&mut tx, block_id, block_version.id).await?;

        tx.commit().await?;

        meilisearch
            .index("blocks")
            .add_documents(
                &[Block::generate_searchable_object(&block, &block_version)],
                Some("id"),
            )
            .await?;

        sender.send(VerbandEvent::PostBlockUpdated(PostBlockUpdatedEvent {
            post_id: block.post_id,
            block_id: block.id,
        }))?;

        Ok(block)
    }
}
