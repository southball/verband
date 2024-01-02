db-reset:
	docker compose exec backend sqlx database reset

db-migrate:
	docker compose exec backend sqlx migrate run

db-revert:
	docker compose exec backend sqlx migrate revert

db-generate-migration/%:
	docker compose exec backend sqlx migrate add -r $(notdir $@)
	sudo bash -c "chown -R $$USER:$$GROUP ./backend/migrations"
