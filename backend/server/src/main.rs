use async_graphql::http::GraphiQLSource;
use async_graphql_axum::{GraphQLRequest, GraphQLResponse};
use axum::{
    error_handling::HandleErrorLayer,
    http::StatusCode,
    response::{Html, IntoResponse},
    routing::get,
    BoxError, Extension, Router, Server,
};
use std::net::SocketAddr;
use tower::ServiceBuilder;
use tower_sessions::{
    cookie::time::Duration,
    sqlx::{postgres::PgPoolOptions, PgPool},
    Expiry, PostgresStore, Session, SessionManagerLayer,
};
use verband_graphql::{verband_schema, VerbandSchema};

async fn graphiql() -> impl IntoResponse {
    Html(GraphiQLSource::build().endpoint("/api/graphql").finish())
}

async fn graphql_handler(
    Extension(schema): Extension<VerbandSchema>,
    Extension(pool): Extension<PgPool>,
    session: Session,
    req: GraphQLRequest,
) -> GraphQLResponse {
    let req = req.into_inner().data(session).data(pool);
    schema.execute(req).await.into()
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let database_url = std::env::var("DATABASE_URL")?;
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await?;
    let session_store = PostgresStore::new(pool.clone());
    session_store.migrate().await?;
    let session_layer = ServiceBuilder::new()
        .layer(HandleErrorLayer::new(|_: BoxError| async {
            StatusCode::BAD_REQUEST
        }))
        .layer(
            SessionManagerLayer::new(session_store)
                .with_secure(false)
                .with_expiry(Expiry::OnInactivity(Duration::weeks(1))),
        );

    let schema = verband_schema();

    let app = Router::new()
        .route("/api/graphql", get(graphiql).post(graphql_handler))
        .layer(Extension(schema))
        .layer(Extension(pool))
        .layer(session_layer);

    let addr = SocketAddr::from(([0, 0, 0, 0], 8000));

    Ok(Server::bind(&addr).serve(app.into_make_service()).await?)
}
