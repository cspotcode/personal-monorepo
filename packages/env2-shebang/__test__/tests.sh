#!/usr/bin/env bash
set -euo pipefail

__dirname="$(CDPATH='' cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

export PATH
PATH="$__dirname/bin:$(dirname "$__dirname"):$PATH"

# set -x
cd "$__dirname"
[[ "$(./scripts/use-foo)" = "foo ./scripts/use-foo" ]]
[[ "$(./scripts/nested/use-foo)" = "foo ./scripts/nested/use-foo" ]]
[[ "$(./scripts/use-bar)" = "bar ./scripts/use-bar" ]]
[[ "$(./scripts/use-baz)" = "baz ./scripts/use-baz" ]]
[[ "$(./scripts/use-biff)" = "biff ./scripts/use-biff" ]]

[[ "$(./scripts/nested/foo-via-second-shebang)" = "foo by-convention ./scripts/nested/foo-via-second-shebang" ]]
[[ "$(./scripts/nested/foo-via-second-shebang-cpp-comment)" = "foo by-convention ./scripts/nested/foo-via-second-shebang-cpp-comment" ]]

# target paths in different styles are passed through
[[ "$("$__dirname/scripts/use-foo")" = "foo $__dirname/scripts/use-foo" ]]

cd "$__dirname/scripts"

[[ "$(./use-foo)" = "foo ./use-foo" ]]
[[ "$(./nested/use-foo)" = "foo ./nested/use-foo" ]]
[[ "$(./use-bar)" = "bar ./use-bar" ]]
[[ "$(./use-baz)" = "baz ./use-baz" ]]
[[ "$(./use-biff)" = "biff ./use-biff" ]]

[[ "$(./nested/foo-via-second-shebang)" = "foo by-convention ./nested/foo-via-second-shebang" ]]
[[ "$(./nested/foo-via-second-shebang-cpp-comment)" = "foo by-convention ./nested/foo-via-second-shebang-cpp-comment" ]]

cd "$__dirname"

# TODO
# test that both .env2rc and ./scripts/nested/.env2rc are honored
# Test that each .env2rc is matched against the right patterns (relative to env2rc file's directory)

echo 'All passed'
