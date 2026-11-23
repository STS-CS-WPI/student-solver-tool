#!/usr/bin/env bash
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DO_BACKUP=true
BACKUP_DIR="/home/backups" # IT made it so backups here last 60 days
DEPLOY_REF=main

usage() {
  cat <<EOF
Usage: $(basename "$0") [options]

Deploy a release tag or full commit SHA using its CI-published GHCR images.
With no --ref, deploy the current origin/main commit.

Options:
      --ref <tag|sha>   Select a release tag, full commit SHA, or main
      --no-backup       Skip SQLite backup
  -h, --help            Show this help message

Examples:
  $(basename "$0")
  $(basename "$0") --ref <release-tag>
  $(basename "$0") --ref <full-commit-sha>
  $(basename "$0") --no-backup
EOF
}

main() {
  # Parse args
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --ref)
        if [[ $# -lt 2 || -z "$2" || "$2" == -* ]]; then
          echo "ERROR: --ref requires a release tag, full commit SHA, or main." >&2
          exit 1
        fi
        DEPLOY_REF="$2"
        shift 2
        ;;
      --no-backup)
        DO_BACKUP=false
        shift
        ;;
      -h|--help)
        usage
        exit 0
        ;;
      *)
        echo "Unknown option: $1"
        echo
        usage
        exit 1
        ;;
    esac
  done

  if [[ "$DEPLOY_REF" != main && ! "$DEPLOY_REF" =~ ^[a-f0-9]{40}$ ]] \
    && ! git check-ref-format "refs/tags/$DEPLOY_REF"; then
    echo "ERROR: Invalid release tag or full commit SHA: $DEPLOY_REF" >&2
    exit 1
  fi

  cd "$APP_DIR"

  echo "==> Deploying sts from $DEPLOY_REF"
  echo "==> Repo dir: $APP_DIR"
  echo "==> Backup enabled: $DO_BACKUP"

  # Make sure docker compose is available
  if ! docker compose version >/dev/null 2>&1; then
    echo "ERROR: docker compose not found. Install Docker + Compose plugin."
    exit 1
  fi

  echo "==> Fetch deployment commit"
  fetch_ref="$DEPLOY_REF"
  if [[ "$DEPLOY_REF" == main ]]; then
    fetch_ref=refs/heads/main
  elif [[ ! "$DEPLOY_REF" =~ ^[a-f0-9]{40}$ ]]; then
    # Fetch the exact remote tag, including annotated tags, rather than a local ref.
    fetch_ref="refs/tags/$DEPLOY_REF"
  fi
  git fetch --no-tags origin "$fetch_ref"
  STS_IMAGE_TAG="$(git rev-parse --verify 'FETCH_HEAD^{commit}')"
  export STS_IMAGE_TAG
  echo "==> Check out $STS_IMAGE_TAG"
  git checkout --detach --force "$STS_IMAGE_TAG"

  echo "==> Pull application and migrator images for $STS_IMAGE_TAG"
  if ! docker compose --profile migrate pull sts sts-migrate; then
    echo "ERROR: Could not pull both images for $DEPLOY_REF at $STS_IMAGE_TAG. Check that both Docker jobs passed and that this server can access GHCR." >&2
    exit 1
  fi

  if [[ "$DO_BACKUP" == true ]]; then
    echo "==> SQLite backup"
    ts="$(date +%Y%m%d-%H%M%S)"

    mkdir -p "$BACKUP_DIR"

    docker run --rm \
      -v sts_sqlite:/data \
      -v "$BACKUP_DIR:/backups" \
      alpine:3 sh -lc "cp -f /data/prod.db /backups/prod.db.$ts 2>/dev/null || true"

    echo "Backup saved to $BACKUP_DIR/prod.db.$ts"
  else
    echo "==> Skipping SQLite backup"
  fi

  echo "==> Run DB migrations"
  docker compose --profile migrate run --rm --pull never sts-migrate

  echo "==> Start / update services"
  docker compose up -d --no-build --remove-orphans

  echo "==> Current status:"
  docker compose ps

  echo "==> Done."
}

# Parse the whole function before checkout can replace this script on disk.
main "$@"; exit "$?"
