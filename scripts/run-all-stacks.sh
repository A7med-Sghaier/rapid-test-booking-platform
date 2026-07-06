#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILE="$ROOT_DIR/docker-compose.yml"
MONGO_CONTAINER="rapid-test-mongo"
MONGO_DATABASE="rapid-test-booking"
SEED_FILE="$ROOT_DIR/docker/mongo-init/01-demo-data.js"

if command -v docker-compose >/dev/null 2>&1; then
  COMPOSE=(docker-compose -f "$COMPOSE_FILE")
else
  COMPOSE=(docker compose -f "$COMPOSE_FILE")
fi

remove_named_container_if_present() {
  local container_name="$1"
  if docker ps -a --format '{{.Names}}' | grep -qx "$container_name"; then
    echo "Removing existing container: $container_name"
    docker rm -f "$container_name" >/dev/null
  fi
}

remove_project_containers() {
  remove_named_container_if_present rapid-test-mongo
  remove_named_container_if_present rapid-test-mailpit
  remove_named_container_if_present rapid-test-api
  remove_named_container_if_present rapid-test-frontend
}

command="${1:-up}"

case "$command" in
  up)
    "${COMPOSE[@]}" up --build
    ;;
  up-detached|upd)
    "${COMPOSE[@]}" up --build -d
    ;;
  down)
    "${COMPOSE[@]}" down --remove-orphans
    ;;
  clean)
    "${COMPOSE[@]}" down -v --remove-orphans
    remove_project_containers
    ;;
  seed)
    # Re-seed demo data into the running MongoDB without wiping the volume.
    # The docker-entrypoint init scripts only run on a fresh volume, so use
    # this after the volume already exists (the seed file is idempotent).
    if ! docker ps --format '{{.Names}}' | grep -qx "$MONGO_CONTAINER"; then
      echo "$MONGO_CONTAINER is not running. Start the stack first: $0 upd"
      exit 1
    fi
    echo "Seeding demo data into MongoDB ($MONGO_DATABASE)..."
    docker exec -i -e "MONGO_INITDB_DATABASE=$MONGO_DATABASE" "$MONGO_CONTAINER" \
      mongosh --quiet <"$SEED_FILE"
    ;;
  logs)
    "${COMPOSE[@]}" logs -f "${@:2}"
    ;;
  ps)
    "${COMPOSE[@]}" ps
    ;;
  restart)
    "${COMPOSE[@]}" restart "${@:2}"
    ;;
  *)
    echo "Usage: $0 {up|up-detached|upd|down|clean|seed|logs|ps|restart}"
    exit 1
    ;;
esac
