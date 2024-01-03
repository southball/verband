use sqlx::PgPool;

pub struct VerbandLoader(PgPool);

mod post;
mod user;
