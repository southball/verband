use async_graphql::MergedObject;

mod user;

#[derive(MergedObject, Default)]
pub struct MutationRoot(user::UserMutation);
