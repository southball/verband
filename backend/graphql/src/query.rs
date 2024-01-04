use async_graphql::MergedObject;

mod block;
mod post;
mod tag;
mod user;

#[derive(MergedObject, Default)]
pub struct QueryRoot(
    user::UserQuery,
    post::PostQuery,
    block::BlockQuery,
    tag::TagQuery,
);
