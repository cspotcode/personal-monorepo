#!/usr/bin/env bash
set -euo pipefail

# Copy a skeleton template of a monorepo

function allFiles() {
    find \
        ./packages/__template__ \
        -path ./packages/__template__/node_modules -prune -o \
        -type f \
        -print
    find \
        '(' \
            -path ./node_modules -o \
            -path ./packages -o \
            -path ./.git -o \
            -path ./.github/ISSUE_TEMPLATE -o \
            -path ./monorepo-template -o \
            -name 'yarn.lock' -o \
            -name '.gitmodules' \
        ')' -prune -o \
        -type f \
        -name '*' \
        -print
    find ./.github/ISSUE_TEMPLATE \
        -name '__template*' -print
}

[ "./monorepo-template/*" != './monorepo-template/*' ] && rm -r monorepo-template/* monorepo-template/.*
echo "Copying files to ./monorepo-template..."
allFiles | while read -r line ; do
    echo "  $line"
    cp --parent "$line" ./monorepo-template
done

echo "fixup..."
pushd ./monorepo-template > /dev/null
yarn fixup
