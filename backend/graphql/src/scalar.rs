use async_graphql::scalar;
use derive_more::From;
use serde::{Deserialize, Serialize};
use sqlx_macros::Type;

#[derive(Clone, Copy, Debug, Hash, PartialEq, Eq, Serialize, Deserialize, From, Type)]
#[sqlx(transparent)]
pub struct UserId(pub i64);
scalar!(UserId);

#[derive(Clone, Copy, Debug, Hash, PartialEq, Eq, Serialize, Deserialize, From, Type)]
#[sqlx(transparent)]
pub struct PostId(pub i64);
scalar!(PostId);

#[derive(Clone, Copy, Debug, Hash, PartialEq, Eq, Serialize, Deserialize, From, Type)]
#[sqlx(transparent)]
pub struct BlockId(pub i64);
scalar!(BlockId);

#[derive(Clone, Copy, Debug, Hash, PartialEq, Eq, Serialize, Deserialize, From, Type)]
#[sqlx(transparent)]
pub struct BlockVersionId(pub i64);
scalar!(BlockVersionId);

#[derive(Clone, Copy, Debug, Hash, PartialEq, Eq, Serialize, Deserialize, From, Type)]
#[sqlx(transparent)]
pub struct TagId(pub i64);
scalar!(TagId);

#[derive(Clone, Copy, Debug, Hash, PartialEq, Eq)]
pub struct BlocksByPostId(pub PostId);

#[derive(Clone, Copy, Debug, Hash, PartialEq, Eq)]
pub struct BlockVersionsByBlockId(pub BlockId);

#[derive(Clone, Copy, Debug, Hash, PartialEq, Eq)]
pub struct TagsByPostId(pub PostId);

#[derive(Clone, Copy, Debug, Hash, PartialEq, Eq)]
pub struct PostsByCreatorId(pub UserId);
