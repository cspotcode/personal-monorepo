#!/usr/bin/env bash
__dirname="$(CDPATH= cd "$(dirname "$( readlink "${BASH_SOURCE[0]}" || printf "%s" "${BASH_SOURCE[0]}" )")" && pwd)"
. $__dirname/package-scripts-header.sh

case "$script" in
###<NAMES>
clean)
    tsc --build --clean
    ;;

build)
    # TODO run codegen

    # Normal build and typecheck
    # WARNING this also builds references source code in other packages; is that good?
    tsc --build --verbose

    # Build esm
    [ -d ./dist-esm ] && rm -r ./dist-esm
    pushd src
    # TODO stop suppressing errors
    tsc -p . --outDir ../dist-esm --module esnext || true
    popd
    ../../scripts/js-to-mjs.ts ./dist-esm ./dist
    rm -r ./dist-esm

    # TODO rebuild README
    ;;

test)
    # TODO mocha
    # TODO linting
    tslint --config ../../tslint.json --project src

    mocha

    comprehensive-npmignore
    ;;

prepublishOnly)
    yarn run clean
    yarn run build
    yarn run test
    set -x
    for extraClean in \
        tsconfig.tsbuildinfo \
        dist/tsconfig.tsbuildinfo \
        src/tsconfig.tsbuildinfo \
        test/tsconfig.tsbuildinfo \
        example/tsconfig.tsbuildinfo
    do
        if [[ -e "$extraClean" ]]; then rm "$extraClean" ; fi
    done
    ;;

docs)
    # TODO render docs site
    ;;
###</NAMES>
*)
    unrecognizedCommand
    ;;
esac
