use argon2::{
    password_hash::{rand_core::OsRng, SaltString},
    Argon2, PasswordHash, PasswordHasher, PasswordVerifier,
};
use async_graphql::{Context, Object};
use sqlx::PgPool;
use tower_sessions::Session;

use crate::{
    model::{User, UserCreateData, UserUpdateData, UserUpdateInput},
    scalar::UserId,
};

#[derive(Default)]
pub struct UserMutation;

#[Object]
impl UserMutation {
    async fn user_login(
        &self,
        ctx: &Context<'_>,
        handle_name: String,
        password: String,
    ) -> async_graphql::Result<User> {
        let pool = ctx.data::<PgPool>()?;
        let mut conn = pool.acquire().await?;
        let session = ctx.data::<Session>()?;

        let Some(user) = User::find_by_handle_name(&mut conn, &handle_name).await? else {
            return Err(async_graphql::Error::new("User does not exist."));
        };

        let password_hash = PasswordHash::new(&user.password_hash)?;

        if !Argon2::default()
            .verify_password(password.as_bytes(), &password_hash)
            .is_ok()
        {
            return Err(async_graphql::Error::new("Password is not correct."));
        }

        session.insert("user_id", user.id)?;

        Ok(user)
    }

    async fn user_register(
        &self,
        ctx: &Context<'_>,
        #[graphql(validator(min_length = 3))] handle_name: String,
        #[graphql(validator(min_length = 1))] display_name: String,
        #[graphql(validator(min_length = 8))] password: String,
    ) -> async_graphql::Result<bool> {
        let pool = ctx.data::<PgPool>()?;
        let mut tx = pool.begin().await?;

        let salt = SaltString::generate(&mut OsRng);
        let password_hash = Argon2::default()
            .hash_password(password.as_bytes(), &salt)?
            .to_string();

        if User::find_by_handle_name(&mut tx, &handle_name)
            .await?
            .is_some()
        {
            return Err(async_graphql::Error::new("Handle name is already used."));
        }

        User::create(
            &mut tx,
            &UserCreateData {
                handle_name,
                display_name,
                password_hash,
            },
        )
        .await?;

        tx.commit().await?;

        Ok(true)
    }

    async fn user_update(
        &self,
        ctx: &Context<'_>,
        input: UserUpdateInput,
    ) -> async_graphql::Result<User> {
        let pool = ctx.data::<PgPool>()?;
        let mut tx = pool.begin().await?;
        let session = ctx.data::<Session>()?;

        let Some(user_id) = session.get::<i64>("user_id")? else {
            return Err(async_graphql::Error::new("Not logged in."));
        };

        let Some(user) = User::find_by_ids(&mut tx, &[UserId(user_id)]).await?.pop() else {
            return Err(async_graphql::Error::new("User not found."));
        };

        let user_update_data = UserUpdateData {
            handle_name: input.handle_name.unwrap_or(user.handle_name),
            display_name: input.display_name.unwrap_or(user.display_name),
            password_hash: input.password_hash.unwrap_or(user.password_hash),
        };

        let user = User::update(&mut tx, UserId(user_id), &user_update_data).await?;
        tx.commit().await?;

        Ok(user)
    }

    async fn user_logout(&self, ctx: &Context<'_>) -> async_graphql::Result<bool> {
        let session = ctx.data::<Session>()?;
        session.clear();
        Ok(true)
    }
}
