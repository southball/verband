use std::collections::HashMap;

use async_graphql::dataloader::Loader;

use crate::{model::User, scalar::UserId};

use super::VerbandLoader;

#[async_trait::async_trait]
impl Loader<UserId> for VerbandLoader {
    type Value = User;
    type Error = async_graphql::Error;

    async fn load(&self, ids: &[UserId]) -> async_graphql::Result<HashMap<UserId, User>> {
        let mut conn = self.0.acquire().await?;
        let users = User::find_by_ids(&mut conn, &ids).await?;
        let mut result = HashMap::new();
        for user in users {
            result.insert(user.id, user);
        }
        Ok(result)
    }
}
