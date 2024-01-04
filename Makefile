default: help

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

db-reset: ## 
	docker compose exec backend sqlx database reset

db-migrate: ## 
	docker compose exec backend sqlx migrate run

db-revert: ## 
	docker compose exec backend sqlx migrate revert

db-enter: ## 
	docker compose exec db psql -U postgres verband

db-generate-migration/%: ## 
	docker compose exec backend sqlx migrate add -r $(notdir $@)
	sudo bash -c "chown -R $$USER:$$GROUP ./backend/migrations"

fix-permissions: ## backend/target, frontend/node_modules の owner を修正する
	sudo chown -R $$USER:$$GROUP ./backend/target ./frontend/node_modules

generate-graphql-schema: ## schema.gql を更新する
	docker compose exec backend cargo run --bin generate-graphql-schema > ./schema.gql
