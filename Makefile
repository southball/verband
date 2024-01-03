db-reset:
	docker compose exec backend sqlx database reset

db-migrate:
	docker compose exec backend sqlx migrate run

db-revert:
	docker compose exec backend sqlx migrate revert

db-enter:
	docker compose exec db psql -U postgres verband

db-generate-migration/%:
	docker compose exec backend sqlx migrate add -r $(notdir $@)
	sudo bash -c "chown -R $$USER:$$GROUP ./backend/migrations"

fix-permissions:
	sudo chown -R $$USER:$$GROUP ./backend/target ./frontend/node_modules