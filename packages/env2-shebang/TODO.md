Rust implementation for Windows npm support.

"shellwords" to parse the shebang.
https://github.com/jimmycuadra/rust-shellwords

Alternative: shlex
https://docs.rs/shlex/0.1.1/shlex/

How to publish native binary for all platforms?
npm will symlink to env2 on Linux
on Windows should be env2.exe
on Mac...???

On Windows env2.exe
On Mac and Linux, env2 shell scripts (only way to deploy a single executable to both platforms)



Rust implementation:
extract second line
split via shellwords
set all env variables
extract executable
locate executable via which

if executable requires shell (is not .com nor .exe):
    escape command and args according to cmd escaping rules
    grab process.env.comspec || 'cmd.exe'
    COMSPEC /d /s /c <escaped args>
else:
    run the command like normal
    TODO does rust's argument escaping work correctly?  Exact inverse of CommandLineToArgvW?


On Windows, allow alternative shebang on line 3:

    #!/usr/bin/env env2
    #!<linux command goes here>
    #!windows <windows command goes here>

Like here: https://scalr-wiki.atlassian.net/wiki/spaces/docs/pages/1778334/Script+Shebang+Line
