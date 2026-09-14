#!/usr/bin/env bash
# Package committed files, exactly as the tag workflow does. No build tools.
# Usage: scripts/package.sh [vX.Y.Z]
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."
[[ $# -le 1 ]] || { echo "Usage: scripts/package.sh [vX.Y.Z]" >&2; exit 1; }
manifest_version=$(git show HEAD:manifest.json | jq -er '.version')
tag=${1:-v$manifest_version}
if [[ ! $tag =~ ^v(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$ || ${tag#v} != "$manifest_version" ]]; then
  echo "error: expected v$manifest_version to match the committed manifest" >&2
  exit 1
fi
# Chrome version components must fit its numeric version format.
jq -en --arg version "$manifest_version" '$version | split(".") | map(tonumber) | all(. <= 65535) and any(. > 0)' >/dev/null
mkdir -p dist
archive="youtube-transcript-grabber-$tag.zip"
git archive --format=zip --output="dist/$archive" HEAD -- \
  manifest.json popup.html popup.css popup.js transcript.js \
  icons/icon-16.png icons/icon-32.png icons/icon-48.png icons/icon-128.png \
  README.md LICENSE
(cd dist && sha256sum "$archive" > "$archive.sha256")
echo "Created dist/$archive (from HEAD, not uncommitted edits)"
