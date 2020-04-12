#!/usr/bin/env bash
__dirname="$(CDPATH= cd "$(dirname "$( readlink "${BASH_SOURCE[0]}" || printf "%s" "${BASH_SOURCE[0]}" )")" && pwd)"
. $__dirname/../../scripts/package-scripts-header.sh

case "$script" in
###<NAMES>

# Delegated commands
clean)
    invokeDefault
    ;;
build)
    # invokeDefault
    pushd src
    tsc --build
    popd
    ;;
test)
    # invokeDefault
    yarn run -T comprehensive-npmignore
    ;;
prepublishOnly)
    invokeDefault
    ;;
###</NAMES>
*)
    unrecognizedCommand
    ;;
esac
