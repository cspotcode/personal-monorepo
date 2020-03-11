#!/usr/bin/env bash
set -euxo pipefail

cat ./package-jsons | while read -r line ; do
    dir="$(mktemp -d)"
    pushd "$dir"
    printf "%s" "$line" > "package.json"
    mkdir node_modules
    chmod 500 node_modules
    yarn --ignore-scripts || true
    popd
    rm -rf "$dir"
done

yarn cache list
