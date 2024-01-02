use async_graphql::{Context, EmptyMutation, EmptySubscription, Object};
use tower_sessions::Session;

pub struct QueryRoot;

#[Object]
impl QueryRoot {
    async fn hello(&self) -> String {
        "Hello, world!".to_string()
    }

    async fn logged_in(&self, ctx: &Context<'_>) -> async_graphql::Result<bool> {
        let session = ctx.data::<Session>()?;
        Ok(session.get::<String>("logged_in")? == Some("1".to_string()))
    }
}

pub struct MutationRoot;

#[Object]
impl MutationRoot {
    async fn login(
        &self,
        ctx: &Context<'_>,
        username: String,
        password: String,
    ) -> async_graphql::Result<bool> {
        let session = ctx.data::<Session>()?;
        session.insert("logged_in", "1".to_string())?;
        Ok(true)
    }
}

pub type VerbandSchema = async_graphql::Schema<QueryRoot, MutationRoot, EmptySubscription>;

pub fn verband_schema() -> VerbandSchema {
    VerbandSchema::build(QueryRoot, MutationRoot, EmptySubscription).finish()
}
