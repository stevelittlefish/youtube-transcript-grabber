#!/usr/bin/env bash
# Push a version tag; GitHub Actions does the testing, packaging, and publishing.
# Usage: scripts/release.sh [vX.Y.Z]
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

fail() { echo "error: $*" >&2; exit 1; }
manifest_version=$(jq -er '.version' manifest.json)

if [[ $# -eq 0 ]]; then
  latest=$(git tag --list 'v*' --sort=-version:refname | sed -n '1p')
  echo "Latest local version tag: ${latest:-none}"
  echo "Manifest version: $manifest_version"
  echo "To release this version: scripts/release.sh v$manifest_version"
  echo "For a new version, update manifest.json and commit it first."
  exit 0
fi
[[ $# -eq 1 ]] || fail "expected one version, e.g. v1.0.0"
version="v${1#v}"
[[ $version =~ ^v(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$ ]] || fail "expected vX.Y.Z"
[[ ${version#v} == "$manifest_version" ]] || fail "tag $version doesn't match manifest.json ($manifest_version); update and commit the manifest first"
[[ $(git branch --show-current) == main ]] || fail "run this from main"
[[ -z $(git status --porcelain) ]] || fail "commit your changes before releasing"
if git show-ref --verify --quiet "refs/tags/$version"; then
  fail "local tag $version already exists"
fi
remote_tag=$(git ls-remote --tags origin "refs/tags/$version")
[[ -z $remote_tag ]] || fail "remote tag $version already exists"

git tag -a "$version" -m "Release $version"
# Send the commit and tag together; neither remote ref changes if either fails.
if ! git push --atomic origin HEAD:refs/heads/main "refs/tags/$version"; then
  fail "push failed; local tag $version remains. Resolve the push error, then retry: git push --atomic origin HEAD:refs/heads/main refs/tags/$version"
fi
echo "Pushed $version. GitHub Actions will publish the ZIP after checks pass:"
echo "https://github.com/stevelittlefish/youtube-transcript-grabber/actions/workflows/release.yml"
