#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/home/backups}" # IT made it so backups here last 60 days
VOLUME="${STS_SQLITE_VOLUME:-sts_sqlite}"
ARCHIVE_KEEP="${ARCHIVE_KEEP:-6}"
LABEL=""

usage() {
  cat <<EOF
Usage: $(basename "$0") --label <manual|archive>

Back up the production SQLite database.

Options:
      --label LABEL     manual (run by hand) or archive (run by the timer)
  -h, --help            Show this help message

Examples:
  $(basename "$0") --label manual
  $(basename "$0") --label archive
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --label)
      LABEL="${2:-}"
      shift 2 || true
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

case "$LABEL" in
  manual)  suffix="-manual" ;;
  archive) suffix="-archive" ;;
  *)
    echo "ERROR: --label must be 'manual' or 'archive'." >&2
    usage >&2
    exit 1
    ;;
esac

if ! [[ "$ARCHIVE_KEEP" =~ ^[1-9][0-9]*$ ]]; then
  echo "ERROR: ARCHIVE_KEEP must be a positive integer (got '$ARCHIVE_KEEP')." >&2
  exit 1
fi

ts="$(date +%Y%m%d-%H%M%S)"
out="prod.db.${ts}${suffix}"

mkdir -p "$BACKUP_DIR"

echo "==> SQLite backup ($LABEL)"

# Exit code 3 from the container means "no database yet" (first ever deploy).
rc=0
docker run --rm \
  -e OUT="$out" \
  -e LABEL="$LABEL" \
  -e ARCHIVE_KEEP="$ARCHIVE_KEEP" \
  -v "$VOLUME:/data" \
  -v "$BACKUP_DIR:/backups" \
  alpine:3 sh -eu -c '
    if [ ! -f /data/prod.db ]; then
      exit 3
    fi

    apk add --no-cache sqlite >/dev/null

    tmp="/backups/.${OUT}.tmp"
    trap "rm -f \"$tmp\"" EXIT

    # Online, consistent snapshot (waits up to 10s if a write is in progress).
    sqlite3 /data/prod.db ".timeout 10000" ".backup \"$tmp\""

    check="$(sqlite3 "$tmp" "PRAGMA integrity_check;")"
    if [ "$check" != "ok" ]; then
      echo "ERROR: integrity check failed on the new backup: $check" >&2
      exit 1
    fi

    objects="$(sqlite3 "$tmp" "SELECT count(*) FROM sqlite_master;")"
    if [ "$objects" -eq 0 ]; then
      echo "ERROR: the new backup has an empty schema." >&2
      exit 1
    fi

    # Only publish the backup once it has passed the checks.
    mv "$tmp" "/backups/$OUT"

    if [ "$LABEL" = "archive" ]; then
      find /backups -maxdepth 1 -type f -name "prod.db.*-archive" \
        | sort -r | tail -n +"$((ARCHIVE_KEEP + 1))" | xargs -r rm -f
    fi
  ' || rc=$?

if [[ "$rc" -eq 3 ]]; then
  echo "No database found in volume '$VOLUME' (first deploy?). Nothing to back up."
  exit 0
elif [[ "$rc" -ne 0 ]]; then
  echo "ERROR: backup failed (exit code $rc). No backup was written." >&2
  exit "$rc"
fi

echo "Backup saved to $BACKUP_DIR/$out"
