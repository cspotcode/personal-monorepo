#!/usr/bin/env bash
__dirname="$(CDPATH= cd "$(dirname "$( readlink "${BASH_SOURCE[0]}" || printf "%s" "${BASH_SOURCE[0]}" )")" && pwd)"
. $__dirname/../../scripts/package-scripts-header.sh

case "$script" in
###<NAMES>

# Delegated commands
build)
    invokeDefault
    chmod +x ./dist/bin/*.js
    ;;
docs)
    invokeDefault
    ;;
test)
    invokeDefault
    ;;
###</NAMES>
*)
    unrecognizedCommand
    ;;
esac
