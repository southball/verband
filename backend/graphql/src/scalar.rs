use async_graphql::scalar;
use derive_more::From;
use serde::{Deserialize, Serialize};

#[derive(Clone, Copy, PartialEq, Eq, Serialize, Deserialize, From)]
pub struct UserId(pub i64);
scalar!(UserId);
