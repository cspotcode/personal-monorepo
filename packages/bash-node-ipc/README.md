Idea I have for implementing parts of a bash script in node.

Write a dictionary of JavaScript functions in a JS script.
Use bash's coprocess feature to launch a node process as a slave to the bash process.
node process sends a string of bash source code that stubs out bash functions, one for every JavaScript function.

When the bash function is invoked, it encodes and sends its arguments to the node process.
The node process runs the JS function, encoding and returning the result to bash.

When bash terminates, coprocess pipe is closed, node process kills itself.

# Usage

Write a JS file similar to `example/node-fns.js` that exports a dictionary of
functions.

Put this snippet at the top of your bash script:

```
eval "$( bash-node-ipc bootstrap $__dirname/node-fns.js node_coproc )"
```

This will launch the node coprocess and declare a bash function corresponding to
each exported node function.  You can now call node functions from bash, and
they'll run within the node coprocess.

For a slight improvement in startup time, inline the bootstrapper directly into
your bash script:

```
bash-node-ipc $__dirname/node-fns.js node_coproc >> ./my-bash-script
```

# TODOs

## Dream list of features

* Pass positional strings and option-bags to a function
  * receiving end passes through minimist() or yargs() to parse
* Streaming async results?
  * piped line by line to bash?
* Alternative return types:
  * return boolean; converts to exit code *(Already implemented)*
  * return dictionary; saved into named variable
  * return array; saved into named variable
* Accept env vars when declared?
  * function must declare all env vars it cares about
  * every time that function is invoked, those env vars are manually passed to
    the function.
  * Broaden this to support bash arrays and dictionaries?
    * something like a list of `implicitlyPassedVariables`?

# TODO

After running the example, bash is in a weird state where arrow keys spit out ANSI
instead of interacting with readline.  Why is this? **FIXED**
