use std::collections::HashMap;

use async_graphql::dataloader::Loader;

use crate::{model::Post, scalar::PostId};

use super::VerbandLoader;

#[async_trait::async_trait]
impl Loader<PostId> for VerbandLoader {
    type Value = Post;
    type Error = async_graphql::Error;

    async fn load(&self, ids: &[PostId]) -> async_graphql::Result<HashMap<PostId, Post>> {
        let mut conn = self.0.acquire().await?;
        let posts = Post::find_by_ids(&mut conn, &ids).await?;
        let mut result = HashMap::new();
        for post in posts {
            result.insert(post.id, post);
        }
        Ok(result)
    }
}
