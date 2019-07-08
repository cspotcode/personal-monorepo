set -euo pipefail
script="$npm_lifecycle_event"
if [ "$script" = "" ] ; then
    script="$1"
    shift
fi

function isWsl {
    [ -f "/proc/version" ] && [[ "$(cat /proc/version)" =~ Microsoft ]]
}
function invokeDefault {
    if [ ! -z ${1+x} ]; then
        npm_lifecycle_event="$1"        "$__dirname/../../scripts/package-scripts.sh" "$@"
    else
        npm_lifecycle_event="$script"   "$__dirname/../../scripts/package-scripts.sh" "$@"
    fi
}
function unrecognizedCommand {
    echo "Unrecognized script: $script"
    exit 1
}
