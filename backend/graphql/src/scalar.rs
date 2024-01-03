use async_graphql::scalar;
use derive_more::From;
use serde::{Deserialize, Serialize};

#[derive(Clone, Copy, Hash, PartialEq, Eq, Serialize, Deserialize, From)]
pub struct UserId(pub i64);
scalar!(UserId);

#[derive(Clone, Copy, Hash, PartialEq, Eq, Serialize, Deserialize, From)]
pub struct PostId(pub i64);
scalar!(PostId);
