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
    ./scripts/fixup.ts
    ;;

new-package)
    mkdir packages/$1
    npm run fixup
    ;;

###</NAMES>
*)
    echo "Unrecognized script: $script"
    exit 1
    ;;
esac
