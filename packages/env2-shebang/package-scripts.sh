#!/usr/bin/env bash
__dirname="$(CDPATH= cd "$(dirname "$( readlink "${BASH_SOURCE[0]}" || printf "%s" "${BASH_SOURCE[0]}" )")" && pwd)"
. $__dirname/../../scripts/package-scripts-header.sh

case "$script" in
###<NAMES>

# Delegated commands
test)
    ./__test__/tests.sh
    ;;
docs)
    invokeDefault
    ;;
###</NAMES>
*)
    unrecognizedCommand
    ;;
esac
