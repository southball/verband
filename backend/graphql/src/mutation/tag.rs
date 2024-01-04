use async_graphql::{Context, Object};
use sqlx::PgPool;

use crate::{
    guard::UserAnyGuard,
    model::{Tag, TagCreateData, TagCreateInput, TagUpdateData, TagUpdateInput},
    scalar::TagId,
};

#[derive(Default)]
pub struct TagMutation;

#[Object]
impl TagMutation {
    #[graphql(guard = "UserAnyGuard")]
    async fn tag_create(
        &self,
        ctx: &Context<'_>,
        input: TagCreateInput,
    ) -> async_graphql::Result<Tag> {
        let pool = ctx.data::<PgPool>()?;
        let mut tx = pool.begin().await?;
        let tag = Tag::create(&mut tx, &TagCreateData { name: input.name }).await?;
        tx.commit().await?;
        Ok(tag)
    }

    #[graphql(guard = "UserAnyGuard")]
    async fn tag_update(
        &self,
        ctx: &Context<'_>,
        id: TagId,
        input: TagUpdateInput,
    ) -> async_graphql::Result<Tag> {
        let pool = ctx.data::<PgPool>()?;
        let mut tx = pool.begin().await?;
        let tag = Tag::update(&mut tx, id, &TagUpdateData { name: input.name }).await?;
        tx.commit().await?;
        Ok(tag)
    }
}
