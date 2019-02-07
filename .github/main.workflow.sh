#!/usr/bin/env bash

printf "\n\n\n================================================\n\n\n"
set -euxo pipefail

script="$1"
shift

export PATH="$PWD/node_modules/.bin:$PATH"

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

bootstrap)
    yarn
    lerna bootstrap
    ;;

build)
    lerna run build
    ;;

test)
    lerna run test
    ;;

docs)
    lerna run docs
    ;;

publish-monorepo-template)
    if [ "$GITHUB_REF" = "refs/heads/master" ] ; then
        ./scripts/publish-monorepo-template.sh
    else
        echo "Not publishing template because this is not the master branch"
    fi
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
