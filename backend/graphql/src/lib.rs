mod dataloader;
mod event;
mod guard;
mod model;
mod mutation;
mod query;
mod scalar;
mod subscription;

use mutation::MutationRoot;
use query::QueryRoot;
use subscription::SubscriptionRoot;

pub use dataloader::VerbandLoader;
pub type VerbandSchema = async_graphql::Schema<QueryRoot, MutationRoot, SubscriptionRoot>;
pub type VerbandEventSender = tokio::sync::broadcast::Sender<VerbandEvent>;

pub(crate) use event::VerbandEvent;

pub fn verband_schema() -> VerbandSchema {
    VerbandSchema::build(
        QueryRoot::default(),
        MutationRoot::default(),
        SubscriptionRoot,
    )
    .finish()
}

pub fn verband_event_bus() -> (
    tokio::sync::broadcast::Sender<VerbandEvent>,
    tokio::sync::broadcast::Receiver<VerbandEvent>,
) {
    tokio::sync::broadcast::channel(1000)
}
