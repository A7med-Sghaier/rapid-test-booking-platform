#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILE="$ROOT_DIR/docker-compose.yml"

if command -v docker-compose >/dev/null 2>&1; then
  COMPOSE=(docker-compose -f "$COMPOSE_FILE")
else
  COMPOSE=(docker compose -f "$COMPOSE_FILE")
fi

command="${1:-up}"

case "$command" in
  up)
    "${COMPOSE[@]}" up --build
    ;;
  up-detached|upd)
    "${COMPOSE[@]}" up --build -d
    ;;
  down)
    "${COMPOSE[@]}" down
    ;;
  clean)
    "${COMPOSE[@]}" down -v --remove-orphans
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
