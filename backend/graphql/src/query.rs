use async_graphql::MergedObject;

mod post;
mod user;

#[derive(MergedObject, Default)]
pub struct QueryRoot(user::UserQuery, post::PostQuery);
