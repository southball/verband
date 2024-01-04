use async_graphql::{SimpleObject, Union};

use crate::scalar::{BlockId, PostId};

#[derive(Clone, Debug, Union)]
pub enum VerbandEvent {
    PostCreated(PostCreatedEvent),
    PostUpdated(PostUpdatedEvent),
    PostBlockCreated(PostBlockCreatedEvent),
    PostBlockUpdated(PostBlockUpdatedEvent),
}

#[derive(Clone, Debug, SimpleObject)]
pub struct PostCreatedEvent {
    pub(crate) post_id: PostId,
}

#[derive(Clone, Debug, SimpleObject)]
pub struct PostUpdatedEvent {
    pub(crate) post_id: PostId,
}

#[derive(Clone, Debug, SimpleObject)]
pub struct PostBlockCreatedEvent {
    pub(crate) post_id: PostId,
    pub(crate) block_id: BlockId,
}

#[derive(Clone, Debug, SimpleObject)]
pub struct PostBlockUpdatedEvent {
    pub(crate) block_id: BlockId,
    pub(crate) post_id: PostId,
}
