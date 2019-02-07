#!/usr/bin/env bash

set -euxo pipefail

script="$1"
shift

function isWsl {
    [ -f "/proc/version" ] && [[ "$(cat /proc/version)" =~ Microsoft ]]
}

case "$script" in
###<NAMES>
skip-template-branch)
    if [  ] ; then

    fi
    ;;

test)
    ;;

docs)
    ;;

shell)
    exec "$@"
    ;;

exit)
    exit "$@"
    ;;

*)
    echo "Unrecognized script: $script"
    exit 1
    ;;
esac
