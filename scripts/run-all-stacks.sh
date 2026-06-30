#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILE="$ROOT_DIR/docker-compose.yml"

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
    echo "Usage: $0 {up|up-detached|upd|down|clean|logs|ps|restart}"
    exit 1
    ;;
esac
