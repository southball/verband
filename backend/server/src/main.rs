use async_graphql::{dataloader::DataLoader, http::GraphiQLSource};
use async_graphql_axum::{GraphQLRequest, GraphQLResponse, GraphQLWebSocket};
use axum::{
    body::BoxBody,
    error_handling::HandleErrorLayer,
    extract::FromRequestParts,
    http::{Request, StatusCode},
    response::{Html, IntoResponse},
    routing::get,
    BoxError, Extension, Router, Server,
};
use std::{convert::Infallible, net::SocketAddr};
use tower::ServiceBuilder;
use tower_sessions::{
    cookie::time::Duration,
    sqlx::{postgres::PgPoolOptions, PgPool},
    Expiry, PostgresStore, Session, SessionManagerLayer,
};
use verband_graphql::{
    verband_event_bus, verband_schema, VerbandEventSender, VerbandLoader, VerbandSchema,
};

async fn graphiql() -> impl IntoResponse {
    Html(
        GraphiQLSource::build()
            .endpoint("/api/graphql")
            .subscription_endpoint("/api/graphql_ws")
            .finish(),
    )
}

async fn graphql_handler(
    Extension(schema): Extension<VerbandSchema>,
    Extension(pool): Extension<PgPool>,
    Extension(sender): Extension<VerbandEventSender>,
    Extension(meilisearch): Extension<meilisearch_sdk::Client>,
    session: Session,
    req: GraphQLRequest,
) -> GraphQLResponse {
    let req = req
        .into_inner()
        .data(session)
        .data(meilisearch)
        .data(pool.clone())
        .data(DataLoader::new(VerbandLoader(pool), tokio::spawn))
        .data(sender);
    schema.execute(req).await.into()
}

async fn graphql_ws_handler<T>(
    Extension(schema): Extension<VerbandSchema>,
    Extension(pool): Extension<PgPool>,
    Extension(sender): Extension<VerbandEventSender>,
    Extension(meilisearch): Extension<meilisearch_sdk::Client>,
    session: Session,
    req: Request<T>,
) -> Result<axum::response::Response<BoxBody>, Infallible> {
    let (mut parts, _body) = req.into_parts();

    let protocol =
        match async_graphql_axum::GraphQLProtocol::from_request_parts(&mut parts, &()).await {
            Ok(protocol) => protocol,
            Err(err) => return Ok(err.into_response().map(axum::body::boxed)),
        };
    let upgrade = match axum::extract::WebSocketUpgrade::from_request_parts(&mut parts, &()).await {
        Ok(protocol) => protocol,
        Err(err) => return Ok(err.into_response().map(axum::body::boxed)),
    };

    let mut data = async_graphql::Data::default();
    data.insert(session);
    data.insert(meilisearch);
    data.insert(pool.clone());
    data.insert(DataLoader::new(VerbandLoader(pool), tokio::spawn));
    data.insert(sender);

    let resp = upgrade
        .protocols(async_graphql::http::ALL_WEBSOCKET_PROTOCOLS)
        .on_upgrade(move |stream| {
            GraphQLWebSocket::new(stream, schema, protocol)
                .with_data(data)
                .serve()
        });
    Ok(resp.into_response().map(axum::body::boxed))
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
    let (sender, mut receiver) = verband_event_bus();

    let meilisearch = meilisearch_sdk::Client::new(
        std::env::var("MEILISEARCH_URL")?,
        Some(std::env::var("MEILISEARCH_KEY")?),
    );

    meilisearch
        .index("posts")
        .set_searchable_attributes(vec!["title"])
        .await?;
    meilisearch
        .index("blocks")
        .set_searchable_attributes(vec!["content"])
        .await?;

    // We need to spawn a task to consume all events so that the channel would neither overflow nor close.
    tokio::spawn(async move {
        loop {
            let _ = receiver.recv().await;
        }
    });

    let app = Router::new()
        .route("/api/graphql", get(graphiql).post(graphql_handler))
        .route_service(
            "/api/graphql_ws",
            get(graphql_ws_handler).post(graphql_ws_handler),
        )
        .layer(Extension(schema))
        .layer(Extension(meilisearch))
        .layer(Extension(pool))
        .layer(Extension(sender))
        .layer(session_layer);

    let addr = SocketAddr::from(([0, 0, 0, 0], 8000));

    Ok(Server::bind(&addr).serve(app.into_make_service()).await?)
}
