## Requirements and constraints:

- bootstrapper should be super-fast
- dirname is an external binary in bash, so can't call that
- calling node is (relatively) slow, so can't call that
- node-binary might not be on system PATH, so can't use a shebang

Bootstrapper needs to discover own location, resolve symlinks, and
invoke node-binary and target `.js` relative to that.

If bootstrapper has hardcoded abs paths:
"$nodeAbsPath" "$targetAbsPath" "$@"
