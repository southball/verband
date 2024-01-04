use async_graphql::{Context, Object};
use sqlx::PgPool;
use tower_sessions::Session;

use crate::{
    event::{PostCreatedEvent, PostUpdatedEvent},
    guard::UserAnyGuard,
    model::{Post, PostCreateData, PostCreateInput, PostUpdateData, PostUpdateInput},
    scalar::{PostId, UserId},
    VerbandEvent, VerbandEventSender,
};

#[derive(Default)]
pub struct PostMutation;

#[Object]
impl PostMutation {
    #[graphql(guard = "UserAnyGuard")]
    async fn post_create(
        &self,
        ctx: &Context<'_>,
        input: PostCreateInput,
    ) -> async_graphql::Result<Post> {
        let pool = ctx.data::<PgPool>()?;
        let sender = ctx.data::<VerbandEventSender>()?;
        let session = ctx.data::<Session>()?;

        let Some(user_id) = session.get::<i64>("user_id")? else {
            return Err(async_graphql::Error::new("Not logged in."));
        };

        let mut tx = pool.begin().await?;

        let post = Post::create(
            &mut tx,
            &PostCreateData {
                title: input.title,
                creator_id: UserId(user_id),
                tag_ids: input.tag_ids,
            },
        )
        .await?;

        tx.commit().await?;

        sender.send(VerbandEvent::PostCreated(PostCreatedEvent {
            post_id: post.id,
        }))?;

        Ok(post)
    }

    #[graphql(guard = "UserAnyGuard")]
    async fn post_update(
        &self,
        ctx: &Context<'_>,
        id: PostId,
        input: PostUpdateInput,
    ) -> async_graphql::Result<Post> {
        let pool = ctx.data::<PgPool>()?;
        let sender = ctx.data::<VerbandEventSender>()?;

        let mut tx = pool.begin().await?;
        let post = Post::update(
            &mut tx,
            id,
            &PostUpdateData {
                title: input.title,
                tag_ids: input.tag_ids,
            },
        )
        .await?;
        tx.commit().await?;

        sender.send(VerbandEvent::PostUpdated(PostUpdatedEvent {
            post_id: post.id,
        }))?;

        Ok(post)
    }
}
