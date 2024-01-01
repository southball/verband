use async_graphql::http::GraphiQLSource;
use async_graphql_axum::{GraphQLRequest, GraphQLResponse};
use axum::{
    extract::State,
    response::{Html, IntoResponse},
    routing::get,
    Router, Server,
};
use std::net::SocketAddr;
use verband_graphql::{verband_schema, VerbandSchema};

async fn graphiql() -> impl IntoResponse {
    Html(GraphiQLSource::build().endpoint("/api/graphql").finish())
}

async fn graphql_handler(
    State(schema): State<VerbandSchema>,
    req: GraphQLRequest,
) -> GraphQLResponse {
    schema.execute(req.into_inner()).await.into()
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let schema = verband_schema();

    let app = Router::new()
        .route("/api/graphql", get(graphiql).post(graphql_handler))
        .with_state(schema);

    let addr = SocketAddr::from(([0, 0, 0, 0], 8000));

    Ok(Server::bind(&addr).serve(app.into_make_service()).await?)
}
