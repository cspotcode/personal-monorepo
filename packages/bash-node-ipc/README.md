Idea I have for implementing parts of a bash script in node.

Write a dictionary of JavaScript functions in a JS script.
Use bash's coprocess feature to launch a node process as a slave to the bash process.
node process sends a string of bash source code that stubs out bash functions, one for every JavaScript function.

When the bash function is invoked, it encodes and sends its arguments to the node process.
The node process runs the JS function, encoding and returning the result to bash.

When bash terminates, coprocess pipe is closed, node process kills itself.

