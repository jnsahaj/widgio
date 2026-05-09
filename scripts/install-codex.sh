#!/usr/bin/env bash
# Install the widgio skill into Codex CLI (user-global).
#
# Usage:
#   ./scripts/install-codex.sh           # installs to ~/.agents/skills/widgio
#   ./scripts/install-codex.sh --repo    # installs to ./.agents/skills/widgio
set -euo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
src="$here/plugin/skills/widgio"

case "${1:-}" in
  --repo)
    dest="$(pwd)/.agents/skills/widgio"
    ;;
  ""|--user)
    dest="$HOME/.agents/skills/widgio"
    ;;
  *)
    echo "usage: $0 [--user|--repo]" >&2
    exit 2
    ;;
esac

mkdir -p "$(dirname "$dest")"
rm -rf "$dest"
cp -R "$src" "$dest"
echo "widgio skill installed at $dest"
echo "Codex will pick it up on next launch. Verify with: codex skills list"
