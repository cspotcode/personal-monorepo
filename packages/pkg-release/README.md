# pkg-release

[![npm version](https://badge.fury.io/js/pkg-release.svg)](https://badge.fury.io/js/pkg-release)

Bundle an npm-published CLI tool as a binary on Github Releases via `pkg`.

* Downloads the module from npm
* Installs into a temp directory
* Uses `pkg` to create binaries
* Uploads binaries to GitHub releases for a given git tag

For usage info, `pkg-release --help`
