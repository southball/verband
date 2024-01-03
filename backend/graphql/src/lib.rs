use async_graphql::EmptySubscription;

mod dataloader;
mod guard;
mod model;
mod mutation;
mod query;
mod scalar;

use mutation::MutationRoot;
use query::QueryRoot;

pub type VerbandSchema = async_graphql::Schema<QueryRoot, MutationRoot, EmptySubscription>;

pub fn verband_schema() -> VerbandSchema {
    VerbandSchema::build(
        QueryRoot::default(),
        MutationRoot::default(),
        EmptySubscription,
    )
    .finish()
}
