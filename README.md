Monorepo for personal projects.  The goal is to reduce duplicated effort and make it
easier to stay consistent between projects.

## Notes

### Adding a pre-existing checkout to this monorepo as a git submodule



---

`git submodule foreach` can run a command for each submodule.
Could be used to periodically update them to the latest master.
Although committing the latest revision to this monorepo isn't really important
as long as my working tree has checkouts at the latest master.

---

Issue templates:

https://github.com/cspotcode/personal-monorepo/issues/new?template=env2-shebang--bug-report.md
https://github.com/cspotcode/personal-monorepo/issues/new?template=env2-shebang--bug-report.md

TODO add pull request templates

---

# Project ideas

In-place templating for markdown files
extend fixup.ts to generate github issue templates
extend README templates to include links to github issue
add a new project template

Extract fenced sections of any file?
###<FOO>
###</FOO>
Expose results as a simple DOM and a dictionary-based hierarchy.
Bonus: this can underpin a markdown fenced section rendering tool.
