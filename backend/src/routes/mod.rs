mod health;
mod search;
mod ai_chat;
mod api_proxy;

use axum::{
    routing::{get, post},
    Router,
};
use sqlx::PgPool;
use tower_http::cors::CorsLayer;

use self::search::AppState;

pub fn create_router(pool: PgPool) -> Router {
    let state = AppState { pool };

    Router::new()
        .route("/health", get(health::health_check))
        .route("/search", post(search::create_search_history))
        .route("/search", get(search::get_recent_searches))
        .route("/api/details", post(ai_chat::get_details))
        .route("/api/maps/config", get(api_proxy::get_maps_config))
        .route("/api/geocode", get(api_proxy::geocode_address))
        .route("/api/gemini", post(api_proxy::gemini_generate))
        .layer(CorsLayer::permissive())
        .with_state(state)
}
