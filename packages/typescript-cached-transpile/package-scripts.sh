#!/usr/bin/env bash
__dirname="$(CDPATH= cd "$(dirname "$( readlink "${BASH_SOURCE[0]}" || printf "%s" "${BASH_SOURCE[0]}" )")" && pwd)"
. $__dirname/../../scripts/package-scripts-header.sh

case "$script" in
###<NAMES>

# Delegated commands
clean)
    tsc --build --clean
    ;;
build)
    tsc --build
    ;;
prepare)
    yarn clean
    yarn build
    yarn test
    ;;
docs)
    invokeDefault
    ;;
test)
    echo "TODO no tests"
    ;;
###</NAMES>
*)
    unrecognizedCommand
    ;;
esac
