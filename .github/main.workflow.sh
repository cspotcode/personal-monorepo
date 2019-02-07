#!/usr/bin/env bash

printf "\n\n\n================================================\n\n\n"
set -euxo pipefail

script="$1"
shift

function isWsl {
    [ -f "/proc/version" ] && [[ "$(cat /proc/version)" =~ Microsoft ]]
}

case "$script" in
###<NAMES>
gatekeeper)
    if [ "$GITHUB_REF" = "refs/heads/template" ] ; then
        echo "Halting; do not run actions on template branch"
        exit 78
    fi
    ;;

test)
    yarn
    lerna bootstrap
    lerna run build
    lerna run test
    ;;

docs)
    lerna run docs
    ;;

shell)
    exec "$@"
    ;;

exit)
    exit "$@"
    ;;

###</NAMES>
*)
    echo "Unrecognized script: $script"
    exit 1
    ;;
esac
