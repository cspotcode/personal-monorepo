#!/usr/bin/env bash

set -eo pipefail

# Implementation for all npm scripts live here.
# Script to run is pulled from $npm_lifecycle_event, which is set
# by NPM when you `npm run script-name-here`.
# Otherwise it's pulled from $1.
# Note that npm adds ./node_modules/.bin to your PATH.  If you invoke this
# script by other means, you must configure PATH yourself.

script="$npm_lifecycle_event"
if [ "$script" = "" ] ; then
    script="$1"
    shift
fi

function isWsl {
    [ -f "/proc/version" ] && [[ "$(cat /proc/version)" =~ Microsoft ]]
}

case "$script" in
###<NAMES>
fixup)
    ./scripts/fixup.ts "$@"
    ;;

new-package)
    mkdir packages/$1
    npm run fixup
    ;;

focus)
    ./scripts/focus.ts "$@"
    ;;

# Run a command in a specific package's subdirectory
package-command)
    package="$1"
    shift
    pushd "./packages/$1"
    "$@"
    ;;

_version-this-package)
    pushd ../..
    yarn run version-package "$npm_package_name" "$@"
    ;;

version-package)
    package="$1"
    shift

    # Assert that git has no staged changes
    git diff --cached --exit-code
    # Assert that affected package.json has no changes
    git diff --exit-code package.json

    # Bump version
    yarn run package-command -- $package yarn version "$@"

    # grab version #
    version="$( yarn run package-command -- node -p "require('./package.json').version" )"

    git add "./packages/$package/package.json"
    git commit -m "$package@$version"
    git tag "$package@$version"
    ;;

###</NAMES>
*)
    echo "Unrecognized script: $script"
    exit 1
    ;;
esac
