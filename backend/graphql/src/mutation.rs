use async_graphql::MergedObject;

mod block;
mod post;
mod tag;
mod user;

#[derive(MergedObject, Default)]
pub struct MutationRoot(
    user::UserMutation,
    post::PostMutation,
    block::BlockMutation,
    tag::TagMutation,
);
