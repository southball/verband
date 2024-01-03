use async_graphql::{Context, Guard};
use tower_sessions::Session;

pub struct UserAnyGuard;

#[async_trait::async_trait]
impl Guard for UserAnyGuard {
    async fn check(&self, ctx: &Context<'_>) -> async_graphql::Result<()> {
        let session = ctx.data::<Session>()?;
        let Some(_user_id) = session.get::<i64>("user_id")? else {
            return Err(async_graphql::Error::new("Not logged in."));
        };
        Ok(())
    }
}
