use async_graphql::{EmptyMutation, EmptySubscription, Object};

pub struct QueryRoot;

#[Object]
impl QueryRoot {
    async fn hello(&self) -> String {
        "Hello, world!".to_string()
    }
}

pub type VerbandSchema = async_graphql::Schema<QueryRoot, EmptyMutation, EmptySubscription>;

pub fn verband_schema() -> VerbandSchema {
    VerbandSchema::build(QueryRoot, EmptyMutation, EmptySubscription).finish()
}
