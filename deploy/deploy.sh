#!/usr/bin/env bash
# Build locally and upload to the server, without GitHub Actions.
#   DEPLOY_TARGET=deploy@yourname.se:/var/www/yourname.se ./deploy/deploy.sh
set -euo pipefail
cd "$(dirname "$0")/.."

: "${DEPLOY_TARGET:?Set DEPLOY_TARGET, e.g. deploy@yourname.se:/var/www/yourname.se}"

hugo --gc --minify
rsync -az --delete --delay-updates public/ "${DEPLOY_TARGET%/}/"
echo "Deployed to $DEPLOY_TARGET"
